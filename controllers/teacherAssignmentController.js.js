// controllers/teacherAssignmentController.js
const Assignment = require("../models/assignment");
const AssignmentResource = require("../models/assignmentResources");
const AssignmentSubmission = require("../models/assignmentSubmission");

const {
  computeAvailability,
  buildTeacherListFilters,
  parsePagination,
  toTeacherAssignmentListItemDTO,
  toTeacherAssignmentDetailDTO,
  handleError,
} = require("../utils/assignment");

/**
 * POST /api/teacher/assignments
 * Create assignment (draft or published)
 * Expects: { section, subject, title, description?, type, assignedBy, dueDate?, maxMarks?, publishAt?, status? }
 * Note: assignedBy should be the teacher id (in production this comes from auth)
 */
async function createAssignment(req, res) {
  try {
    const payload = req.body;
    // Basic validation
    if (
      !payload.section ||
      !payload.subject ||
      !payload.title ||
      !payload.type ||
      !payload.assignedBy
    ) {
      return res.status(400).json({
        error: "section, subject, title, type and assignedBy are required",
      });
    }

    // Ensure status sensible default
    const assignment = await Assignment.create({
      section: payload.section,
      subject: payload.subject,
      title: payload.title,
      description: payload.description || "",
      type: payload.type,
      assignedBy: payload.assignedBy,
      dueDate: payload.dueDate || null,
      maxMarks: payload.maxMarks || null,
      publishAt: payload.publishAt || null,
      status: payload.status || "draft",
    });

    return res
      .status(201)
      .json({ assignment: toTeacherAssignmentDetailDTO(assignment) });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * PATCH /api/teacher/assignments/:id
 * Edit metadata (title, dueDate, maxMarks, description, type)
 * Accepts only safe fields to prevent accidental overwrites.
 */
async function updateAssignment(req, res) {
  try {
    const id = req.params.id;
    const safe = {};
    const allowed = [
      "title",
      "description",
      "dueDate",
      "maxMarks",
      "type",
      "status",
      "publishAt",
      "subject",
      "section",
    ];
    for (const k of allowed) {
      if (k in req.body) safe[k] = req.body[k];
    }

    const updated = await Assignment.findByIdAndUpdate(
      id,
      { $set: safe },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Assignment not found" });
    return res.json({ assignment: toTeacherAssignmentDetailDTO(updated) });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * PATCH /api/teacher/assignments/:id/publish
 * Body: { publishAt? (optional), status? ("published"|"draft") }
 * If publishAt provided and in future, assignment is scheduled.
 */
async function publishAssignment(req, res) {
  try {
    const id = req.params.id;
    const { publishAt, status } = req.body;

    const update = {};
    if (publishAt !== undefined) update.publishAt = publishAt;
    if (status !== undefined) update.status = status;

    // Default if no explicit status passed: publish
    if (!("status" in update)) update.status = "published";

    const updated = await Assignment.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Assignment not found" });

    return res.json({ assignment: toTeacherAssignmentDetailDTO(updated) });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * PATCH /api/teacher/assignments/:id/archive
 * Soft delete: mark as archived
 */
async function archiveAssignment(req, res) {
  try {
    const id = req.params.id;
    const updated = await Assignment.findByIdAndUpdate(
      id,
      { $set: { status: "archived" } },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Assignment not found" });
    return res.json({ assignment: toTeacherAssignmentDetailDTO(updated) });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * DELETE /api/teacher/assignments/:id
 * Hard delete (optional). Pass ?force=true to physically remove.
 */
async function deleteAssignment(req, res) {
  try {
    const id = req.params.id;
    const force = req.query.force === "true";

    if (force) {
      // Remove resources and submissions optionally — you may prefer to keep them.
      await AssignmentResource.deleteMany({ assignment: id });
      await AssignmentSubmission.deleteMany({ assignment: id });
      const removed = await Assignment.findByIdAndDelete(id);
      if (!removed)
        return res.status(404).json({ error: "Assignment not found" });
      return res.json({ success: true });
    } else {
      // Soft delete -> archived
      const updated = await Assignment.findByIdAndUpdate(
        id,
        { $set: { status: "archived" } },
        { new: true }
      );
      if (!updated)
        return res.status(404).json({ error: "Assignment not found" });
      return res.json({ assignment: toTeacherAssignmentDetailDTO(updated) });
    }
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * GET /api/teacher/assignments
 * List assignments with filters and pagination
 * Query params: section, subject, status, type, assignedBy, fromDate, toDate, page, limit, sortBy, sortDir
 */
async function listAssignments(req, res) {
  try {
    const q = req.query || {};
    const filters = buildTeacherListFilters(q);
    const { limit, skip, sort, page } = parsePagination(q);

    // Optionally populate section/subject for DTOs
    const docs = await Assignment.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("section", "name")
      .populate("subject", "name");

    // Lightweight count for pagination
    const total = await Assignment.countDocuments(filters);

    const items = docs.map(toTeacherAssignmentListItemDTO);
    return res.json({ items, total, page, limit });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * GET /api/teacher/assignments/:id
 * Return assignment detail
 */
async function getAssignmentDetail(req, res) {
  try {
    const id = req.params.id;
    const doc = await Assignment.findById(id)
      .populate("section", "name")
      .populate("subject", "name")
      .populate("assignedBy", "name");

    if (!doc) return res.status(404).json({ error: "Assignment not found" });

    return res.json({ assignment: toTeacherAssignmentDetailDTO(doc) });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * GET /api/teacher/assignments/:id/availability
 * Role-scoped visibility check for teachers (useful for debugging scheduled publishes)
 */
async function getAssignmentAvailability(req, res) {
  try {
    const id = req.params.id;
    const doc = await Assignment.findById(id);
    if (!doc) return res.status(404).json({ error: "Assignment not found" });

    const availability = computeAvailability(doc, new Date());
    return res.json({ availability });
  } catch (err) {
    return handleError(res, err);
  }
}

module.exports = {
  createAssignment,
  updateAssignment,
  publishAssignment,
  archiveAssignment,
  deleteAssignment,
  listAssignments,
  getAssignmentDetail,
  getAssignmentAvailability,
};
