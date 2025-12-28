const Class = require("../models/class");
const { isPrivileged } = require("../utils/authorization");
const { validateSchool, validateClass } = require("../utils/validators");

/**
 * Create Class (Grade 1–12)
 * POST /classes
 */
exports.createClass = async (req, res) => {
  try {
    const { actorId, schoolId, grade } = req.body;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    if (!schoolId || grade === undefined) {
      return res
        .status(400)
        .json({ message: "schoolId and grade are required" });
    }

    if (grade < 1 || grade > 12) {
      return res
        .status(400)
        .json({ message: "grade must be between 1 and 12" });
    }

    const school = await validateSchool(schoolId);
    if (!school) return res.status(404).json({ message: "School not found" });

    const cls = await Class.create({ schoolId, grade });

    return res.status(201).json({
      message: "Class created successfully",
      class: cls,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Class already exists for this school",
      });
    }

    return res.status(500).json({
      message: "Failed to create class",
      error: err.message,
    });
  }
};

/**
 * Get Classes by School
 * GET /classes?actorId=&schoolId=
 */
exports.getClassesBySchool = async (req, res) => {
  try {
    const { actorId, schoolId } = req.query;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    if (!schoolId) {
      return res.status(400).json({ message: "schoolId is required" });
    }

    const school = await validateSchool(schoolId);
    if (!school) return res.status(404).json({ message: "School not found" });

    const classes = await Class.find({
      schoolId,
    }).sort({ grade: 1 });

    return res.status(200).json({
      count: classes.length,
      classes,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch classes",
      error: err.message,
    });
  }
};

/**
 * Update Class
 * PUT /classes/:id
 */
exports.updateClass = async (req, res) => {
  try {
    const { actorId, grade, isActive } = req.body;
    const { id } = req.params;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    const cls = await validateClass(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (grade !== undefined) {
      if (grade < 1 || grade > 12)
        return res
          .status(400)
          .json({ message: "grade must be between 1 and 12" });
      cls.grade = grade;
    }

    if (typeof isActive === "boolean") {
      cls.isActive = isActive;
    }

    await cls.save();

    return res.json({
      message: "Class updated successfully",
      class: cls,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update class",
      error: err.message,
    });
  }
};

/**
 * Soft Delete Class
 * DELETE /classes/:id
 */
exports.deleteClass = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    const cls = await validateClass(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    cls.isActive = false;
    await cls.save();

    return res.json({ message: "Class deactivated successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete class",
      error: err.message,
    });
  }
};
/**
 * Activate / Deactivate Class
 * PUT /classes/:id/status
 */
exports.toggleClassStatus = async (req, res) => {
  try {
    const { actorId, isActive } = req.body;
    const { id } = req.params;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    const cls = await validateClass(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    cls.isActive = Boolean(isActive);
    await cls.save();

    return res.json({
      message: `Class ${isActive ? "activated" : "deactivated"}`,
      class: cls,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update class status",
      error: err.message,
    });
  }
};
