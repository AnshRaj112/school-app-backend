const Teacher = require("../models/teacher");
const TeachingAssignment = require("../models/teachingAssignment");
const Substitution = require("../models/substituteAssignment");

const { isPrivileged } = require("../utils/authorization");
const { validateSchool } = require("../utils/validators");

/**
 * Create Teacher
 */
exports.createTeacher = async (req, res) => {
  try {
    const auth = await isPrivileged(req.body.actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    const {
      schoolId,
      username,
      email,
      password,
      fullName,
      roles,
      teachableGrades,
    } = req.body;

    const school = await validateSchool(schoolId);
    if (!school) return res.status(404).json({ message: "School not found" });

    const teacher = await Teacher.create({
      schoolId,
      username,
      email,
      password,
      fullName,
      roles,
      teachableGrades,
    });

    res.status(201).json({ message: "Teacher created", teacher });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }
    res
      .status(500)
      .json({ message: "Failed to create teacher", error: err.message });
  }
};

/**
 * Get Teachers by School
 */
exports.getTeachersBySchool = async (req, res) => {
  const auth = await isPrivileged(req.query.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const teachers = await Teacher.find({
    schoolId: req.query.schoolId,
  }).sort({ fullName: 1 });

  res.json({ teachers });
};

/**
 * Get Teacher Profile (FULL VIEW)
 */
exports.getTeacherById = async (req, res) => {
  const auth = await isPrivileged(req.query.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });

  const assignments = await TeachingAssignment.find({
    teacherId: teacher._id,
    isActive: true,
  })
    .populate("subjectId", "name code")
    .populate({
      path: "sectionId",
      select: "name classId",
      populate: { path: "classId", select: "grade" },
    });

  const substitutions = await Substitution.find({
    substituteTeacherId: teacher._id,
    isActive: true,
  });

  res.json({
    teacher,
    assignments,
    substitutions,
  });
};

/**
 * Get Eligible Teachers for Assignment
 */
exports.getEligibleTeachers = async (req, res) => {
  const auth = await isPrivileged(req.query.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const { schoolId, classGrade } = req.query;

  const teachers = await Teacher.find({
    schoolId,
    isActive: true,
    roles: "subject_teacher",
    teachableGrades: {
      $elemMatch: {
        from: { $lte: Number(classGrade) },
        to: { $gte: Number(classGrade) },
      },
    },
  }).sort({ fullName: 1 });

  res.json({ teachers });
};

/**
 * Update Teacher
 */
exports.updateTeacher = async (req, res) => {
  const auth = await isPrivileged(req.body.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!teacher) return res.status(404).json({ message: "Teacher not found" });

  res.json({ message: "Teacher updated", teacher });
};

/**
 * Activate / Deactivate Teacher
 */
exports.updateTeacherStatus = async (req, res) => {
  const auth = await isPrivileged(req.body.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  );

  res.json({ message: "Teacher status updated", teacher });
};
