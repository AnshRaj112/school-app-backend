// utils/assignmentUtils.js
//const dayjs = require("dayjs"); // optional, use native Date if you prefer

/**
 * Compute availability for an assignment.
 * Returns object: { isVisible, canSubmit, isLate, publishAt, dueDate }
 */
function computeAvailability(assignment, now = new Date()) {
  if (!assignment) return { isVisible: false, canSubmit: false, isLate: false };

  const publishAt = assignment.publishAt || null;
  const dueDate = assignment.dueDate || null;

  const isPublished = assignment.status === "published";
  const publishedNow = !publishAt || (publishAt && new Date(publishAt) <= now);
  const isVisible = isPublished && publishedNow;

  let canSubmit = false;
  let isLate = false;

  if (isVisible) {
    if (!dueDate) {
      canSubmit = true;
      isLate = false;
    } else {
      const due = new Date(dueDate);
      if (now <= due) {
        canSubmit = true;
        isLate = false;
      } else {
        canSubmit = false;
        isLate = true;
      }
    }
  }

  return {
    isVisible,
    canSubmit,
    isLate,
    publishAt,
    dueDate,
  };
}

/**
 * Build filters for teacher listing API from query params.
 * Supported filters: section, subject, status, assignedBy, fromDate, toDate, type
 */
function buildTeacherListFilters(q = {}) {
  const filters = {};
  if (q.section) filters.section = q.section;
  if (q.subject) filters.subject = q.subject;
  if (q.status) filters.status = q.status;
  if (q.type) filters.type = q.type;
  if (q.assignedBy) filters.assignedBy = q.assignedBy;

  // date range on createdAt
  if (q.fromDate || q.toDate) {
    filters.createdAt = {};
    if (q.fromDate) filters.createdAt.$gte = new Date(q.fromDate);
    if (q.toDate) filters.createdAt.$lte = new Date(q.toDate);
  }
  return filters;
}

/**
 * Simple pagination parsing
 */
function parsePagination(q = {}) {
  const page = Math.max(1, parseInt(q.page || "1", 10));
  const limit = Math.min(200, Math.max(1, parseInt(q.limit || "20", 10)));
  const skip = (page - 1) * limit;
  const sortField = q.sortBy || "createdAt";
  const sortDir = q.sortDir === "asc" ? 1 : -1;
  return { page, limit, skip, sort: { [sortField]: sortDir } };
}

/**
 * Map Assignment mongoose doc -> TeacherAssignmentListItemDTO
 */
function toTeacherAssignmentListItemDTO(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title,
    section: doc.section
      ? {
          id: doc.section._id
            ? doc.section._id.toString()
            : doc.section.toString(),
          name: doc.section.name || null,
        }
      : null,
    subject: doc.subject
      ? {
          id: doc.subject._id
            ? doc.subject._id.toString()
            : doc.subject.toString(),
          name: doc.subject.name || null,
        }
      : null,
    status: doc.status,
    type: doc.type,
    dueDate: doc.dueDate || null,
    publishAt: doc.publishAt || null,
    createdAt: doc.createdAt,
    maxMarks: doc.maxMarks || null,
  };
}

/**
 * Map Assignment doc -> TeacherAssignmentDetailDTO
 */
function toTeacherAssignmentDetailDTO(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description || "",
    section: doc.section
      ? {
          id: doc.section._id
            ? doc.section._id.toString()
            : doc.section.toString(),
          name: doc.section.name || null,
        }
      : null,
    subject: doc.subject
      ? {
          id: doc.subject._id
            ? doc.subject._id.toString()
            : doc.subject.toString(),
          name: doc.subject.name || null,
        }
      : null,
    status: doc.status,
    type: doc.type,
    assignedBy: doc.assignedBy
      ? doc.assignedBy._id
        ? doc.assignedBy._id.toString()
        : doc.assignedBy.toString()
      : null,
    dueDate: doc.dueDate || null,
    publishAt: doc.publishAt || null,
    maxMarks: doc.maxMarks || null,
    isGraded: doc.isGraded || false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * standardized error responder
 */
function handleError(res, err, code = 500) {
  console.error(err);
  return res
    .status(code)
    .json({ error: err.message || "Internal Server Error" });
}

module.exports = {
  computeAvailability,
  buildTeacherListFilters,
  parsePagination,
  toTeacherAssignmentListItemDTO,
  toTeacherAssignmentDetailDTO,
  handleError,
};
