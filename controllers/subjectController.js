const Subject = require("../models/subject");
const { isPrivileged } = require("../utils/authorization");
const {
  validateClass,
  validateSchool,
  validateSubject,
} = require("../utils/validators");

/**
 * Create Subject
 * POST /subjects
 */
exports.createSubject = async (req, res) => {
  try {
    const { actorId, schoolId, classId, name, code } = req.body;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    if (!schoolId || !classId || !name || !code) {
      return res.status(400).json({
        message: "schoolId, classId, name and code are required",
      });
    }

    const school = await validateSchool(schoolId);
    if (!school) return res.status(404).json({ message: "School not found" });

    const cls = await validateClass(classId);
    if (!cls) return res.status(404).json({ message: "Invalid classId" });

    // Ensure class belongs to school
    if (cls.schoolId.toString() !== schoolId) {
      return res.status(400).json({
        message: "Class does not belong to this school",
      });
    }

    const subject = await Subject.create({
      schoolId,
      classId,
      name,
      code,
    });

    return res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Subject with same code already exists for this class",
      });
    }

    return res.status(500).json({
      message: "Failed to create subject",
      error: err.message,
    });
  }
};

/**
 * Get Subjects by Class
 * GET /subjects?actorId=&classId=&includeInactive=true
 */
exports.getSubjectsByClass = async (req, res) => {
  try {
    const { actorId, classId, includeInactive } = req.query;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const query = { classId };
    if (!includeInactive) query.isActive = true;

    const subjects = await Subject.find(query).sort({ name: 1 });

    return res.status(200).json({
      count: subjects.length,
      subjects,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch subjects",
      error: err.message,
    });
  }
};

/**
 * Update Subject (name / code only)
 * PUT /subjects/:id
 */
exports.updateSubject = async (req, res) => {
  try {
    const { actorId, name, code } = req.body;
    const { id } = req.params;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    const subject = await validateSubject(id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    if (name) subject.name = name;
    if (code) subject.code = code;

    await subject.save();

    return res.status(200).json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate subject code for this class",
      });
    }

    return res.status(500).json({
      message: "Failed to update subject",
      error: err.message,
    });
  }
};

/**
 * Activate / Deactivate Subject
 * PUT /subjects/:id/status
 */
exports.toggleSubjectStatus = async (req, res) => {
  try {
    const { actorId, isActive } = req.body;
    const { id } = req.params;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    const subject = await validateSubject(id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    subject.isActive = Boolean(isActive);
    await subject.save();

    return res.status(200).json({
      message: `Subject ${isActive ? "activated" : "deactivated"}`,
      subject,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update subject status",
      error: err.message,
    });
  }
};

/**
 * Get Subjects by School (OPTIONAL but useful)
 * GET /subjects/by-school?actorId=&schoolId=
 */
exports.getSubjectsBySchool = async (req, res) => {
  try {
    const { actorId, schoolId } = req.query;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    if (!schoolId)
      return res.status(400).json({ message: "schoolId is required" });

    const subjects = await Subject.find({ schoolId }).sort({
      classId: 1,
      name: 1,
    });

    return res.status(200).json({
      count: subjects.length,
      subjects,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch subjects",
      error: err.message,
    });
  }
};
