const Teacher = require("../models/teacher");
const TeachingAssignment = require("../models/teachingAssignment");
const Substitution = require("../models/substituteAssignment");
const Leave = require("../models/leave");
const Attendance = require("../models/attendance");
const Student = require("../models/student");
const Section = require("../models/section");

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

/**
 * TEACHER: Get pending half-day requests for my sections
 */
exports.getPendingHalfDayRequests = async (req, res) => {
  try {
    const { teacherId } = req.query;
    if (!teacherId) return res.status(400).json({ success: false, message: "teacherId required" });

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

    // Get sections where teacher is class teacher or has teaching assignments
    const assignments = await TeachingAssignment.find({
      teacherId: teacher._id,
      isActive: true,
    }).select("sectionId");

    const sectionIds = assignments.map((a) => a.sectionId);
    const classTeacherSections = await Section.find({ classTeacherId: teacher._id }).select("_id");
    sectionIds.push(...classTeacherSections.map((s) => s._id));

    const students = await Student.find({ section: { $in: sectionIds } }).select("_id");
    const studentIds = students.map((s) => s._id);

    const requests = await Leave.find({
      student: { $in: studentIds },
      isHalfDay: true,
      status: "pending",
    })
      .populate("student", "fullName")
      .populate({
        path: "student",
        populate: { path: "section", select: "name", populate: { path: "classId", select: "grade" } },
      })
      .sort({ fromDate: 1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * TEACHER: Verify/Approve half-day request
 */
exports.verifyHalfDayRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { teacherId, action } = req.body; // action: "approve" or "reject"

    if (!teacherId) return res.status(400).json({ success: false, message: "teacherId required" });
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "action must be 'approve' or 'reject'" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

    const request = await Leave.findById(requestId).populate("student");
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (!request.isHalfDay) {
      return res.status(400).json({ success: false, message: "Not a half-day request" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request already processed" });
    }

    const student = request.student;
    if (!student.section) {
      return res.status(400).json({ success: false, message: "Student has no section" });
    }

    // Check if teacher has permission (class teacher or teaching assignment)
    const isClassTeacher = await Section.findOne({
      _id: student.section,
      classTeacherId: teacher._id,
    });
    const hasAssignment = await TeachingAssignment.findOne({
      sectionId: student.section,
      teacherId: teacher._id,
      isActive: true,
    });

    if (!isClassTeacher && !hasAssignment) {
      return res.status(403).json({ success: false, message: "Not authorized to verify this request" });
    }

    if (action === "approve") {
      request.status = "approved";
      request.verifiedBy = teacher._id;
      request.verifiedAt = new Date();
      await request.save();

      // Create attendance record for half-day
      const attendanceDate = new Date(request.fromDate);
      attendanceDate.setHours(0, 0, 0, 0);

      await Attendance.findOneAndUpdate(
        {
          student: student._id,
          date: attendanceDate,
        },
        {
          school: student.school,
          section: student.section,
          student: student._id,
          date: attendanceDate,
          status: "half_day",
          halfDayType: request.halfDayType,
          markedBy: teacher._id,
          notes: `Half-day approved: ${request.halfDayType}`,
        },
        { upsert: true, new: true }
      );

      res.json({ success: true, message: "Half-day request approved", request });
    } else {
      request.status = "rejected";
      request.verifiedBy = teacher._id;
      request.verifiedAt = new Date();
      await request.save();

      res.json({ success: true, message: "Half-day request rejected", request });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
