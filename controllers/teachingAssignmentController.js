const TeachingAssignment = require("../models/teachingAssignment");
const { isPrivileged } = require("../utils/authorization");
const {
  validateTeacher,
  validateSection,
  validateSubject,
} = require("../utils/validators");

/**
 * Create Teaching Assignment
 */
exports.createAssignment = async (req, res) => {
  try {
    const auth = await isPrivileged(req.body.actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    const { teacherId, sectionId, subjectId } = req.body;

    if (
      !(await validateTeacher(teacherId)) ||
      !(await validateSection(sectionId)) ||
      !(await validateSubject(subjectId))
    ) {
      return res.status(400).json({ message: "Invalid references" });
    }

    const assignment = await TeachingAssignment.create(req.body);
    res.status(201).json({ message: "Assignment created", assignment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Assignment already exists" });
    }
    res.status(500).json({ message: "Failed to create assignment" });
  }
};

/**
 * Get Assignments by Section
 */
exports.getBySection = async (req, res) => {
  const auth = await isPrivileged(req.query.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const assignments = await TeachingAssignment.find({
    sectionId: req.query.sectionId,
    isActive: true,
  });

  res.json({ assignments });
};

/**
 * Get Assignments by Class
 */
exports.getByClass = async (req, res) => {
  const auth = await isPrivileged(req.query.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const assignments = await TeachingAssignment.find({
    classId: req.query.classId,
    academicYear: req.query.academicYear,
    isActive: true,
  });

  res.json({ assignments });
};

/**
 * Get Assignments by Teacher
 */
exports.getByTeacher = async (req, res) => {
  const auth = await isPrivileged(req.query.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const assignments = await TeachingAssignment.find({
    teacherId: req.query.teacherId,
    isActive: true,
  });

  res.json({ assignments });
};

/**
 * Replace Teacher in Assignment
 */
exports.replaceTeacher = async (req, res) => {
  const auth = await isPrivileged(req.body.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  if (!(await validateTeacher(req.body.newTeacherId))) {
    return res.status(400).json({ message: "Invalid teacher" });
  }

  const assignment = await TeachingAssignment.findByIdAndUpdate(
    req.params.id,
    { teacherId: req.body.newTeacherId },
    { new: true }
  );

  res.json({ message: "Teacher replaced", assignment });
};

/**
 * Activate / Deactivate Assignment
 */
exports.updateAssignmentStatus = async (req, res) => {
  const auth = await isPrivileged(req.body.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const assignment = await TeachingAssignment.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  );

  res.json({ message: "Assignment status updated", assignment });
};
