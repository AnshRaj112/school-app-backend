const Student = require("../models/student");
const Section = require("../models/section");
const School = require("../models/school");
const Class = require("../models/class");
const mongoose = require("mongoose");

const Assignment = require("../models/assignment");
const AssignmentResource = require("../models/assignmentResources");
const AssignmentSubmission = require("../models/assignmentSubmission");
const Attendance = require("../models/attendance");
const Holiday = require("../models/holiday");
const Timetable = require("../models/timetable");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher");
const StudentFee = require("../models/studentFee");
const FeePayment = require("../models/feePayment");
const Leave = require("../models/leave");

// Helper to filter by School ID (assuming it's passed in query or body for now, or auth middleware)
// For real auth, req.user.schoolId would be used.
// We'll assume a query param `schoolId` is available for listing.

exports.createStudent = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      school,
      section,
      guardians,
      isActive,
    } = req.body;

    // Check if section belongs to school (optional safety check)
    if (section) {
      const sectionExists = await Section.findById(section);
      if (!sectionExists) {
        return res
          .status(404)
          .json({ message: "Section not found", success: false });
      }
    }

    const newStudent = new Student({
      username,
      email,
      password,
      fullName,
      school,
      section,
      guardians,
      isActive,
    });

    await newStudent.save();

    res.status(201).json({
      message: "Student created successfully",
      student: newStudent,
      success: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Username or Email already exists",
        success: false,
      });
    }
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      classId, // We might filter by class indirectly via sections or if we add class field to student
      sectionId,
      schoolId,
    } = req.query;

    const query = {};

    if (schoolId) query.school = schoolId;
    if (sectionId) query.section = sectionId;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    // If filtering by classId, we need to find all sections in that class first
    if (classId && !sectionId) {
      const sections = await Section.find({ classId: classId }).select('_id');
      const sectionIds = sections.map(s => s._id);
      query.section = { $in: sectionIds };
    }

    const students = await Student.find(query)
      .populate({
        path: "section",
        select: "name classId",
        model: Section,
        populate: {
          path: "classId",
          select: "grade",
          model: Class,
        },
      })
      .populate({ path: "school", select: "name", model: School })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.status(200).json({
      students,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalStudents: total,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate({ path: "section", model: Section })
      .populate({ path: "school", model: School });
    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found", success: false });
    }
    res.status(200).json({ student, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent Updating Password through this route if needed, or handle hashing in model Pre-save hook
    // The model pre-hook handles password hashing on 'save', but for findOneAndUpdate we added a hook too.

    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ message: "Student not found", success: false });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    // Hard delete for now. Soft delete would toggle 'isActive'
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res
        .status(404)
        .json({ message: "Student not found", success: false });
    }

    res
      .status(200)
      .json({ message: "Student deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function loadStudentContext(studentId) {
  const student = await Student.findById(studentId).populate("school").populate({
    path: "section",
    populate: { path: "classId", select: "grade" },
  });
  if (!student) return { ok: false, status: 404, message: "Student not found" };
  if (!student.isActive)
    return { ok: false, status: 403, message: "Student is inactive" };
  if (!student.school)
    return { ok: false, status: 400, message: "Student is missing school" };
  if (!student.section)
    return { ok: false, status: 400, message: "Student is missing section" };
  return { ok: true, student };
}

/**
 * STUDENT VIEW: Dashboard (assignments, attendance, timetable, holidays, fees)
 */
exports.getStudentDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid student id" });

    const ctx = await loadStudentContext(id);
    if (!ctx.ok) return res.status(ctx.status).json({ success: false, message: ctx.message });

    const student = ctx.student;
    const now = new Date();

    const [assignments, attendanceRecent, holidaysUpcoming, timetable, fees, payments] =
      await Promise.all([
        Assignment.find({
          section: student.section._id,
          status: "published",
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate("subject", "name code")
          .populate("assignedBy", "fullName"),

        Attendance.find({
          student: student._id,
          section: student.section._id,
        })
          .sort({ date: -1 })
          .limit(60),

        Holiday.find({
          school: student.school._id,
          date: { $gte: new Date(now.toDateString()) },
        })
          .sort({ date: 1 })
          .limit(20),

        Timetable.find({
          schoolId: student.school._id,
          sectionId: student.section._id,
        })
          .sort({ dayOfWeek: 1, startMinute: 1 })
          .populate("subjectId", "name code")
          .populate("teacherId", "fullName"),

        StudentFee.find({ student: student._id, school: student.school._id })
          .sort({ academicYearStart: -1 })
          .limit(5),

        FeePayment.find({ student: student._id, school: student.school._id })
          .sort({ receivedAt: -1 })
          .limit(20),
      ]);

    // Attach submissions for assignments (quick lookup)
    const assignmentIds = assignments.map((a) => a._id);
    const submissions = assignmentIds.length
      ? await AssignmentSubmission.find({
          assignment: { $in: assignmentIds },
          student: student._id,
        })
          .select("assignment status submittedAt updatedAt marksObtained feedback attachments")
          .lean()
      : [];

    const submissionsByAssignment = new Map(
      submissions.map((s) => [String(s.assignment), s])
    );

    const assignmentsWithMySubmission = assignments.map((a) => ({
      ...a.toObject(),
      mySubmission: submissionsByAssignment.get(String(a._id)) || null,
    }));

    // Attendance summary
    const attendanceSummary = attendanceRecent.reduce(
      (acc, a) => {
        acc.total += 1;
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      },
      { total: 0, present: 0, absent: 0, late: 0, excused: 0 }
    );

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        fullName: student.fullName,
        school: { _id: student.school._id, name: student.school.name },
        section: student.section,
      },
      assignments: assignmentsWithMySubmission,
      attendance: {
        recent: attendanceRecent,
        summary: attendanceSummary,
      },
      holidaysUpcoming,
      timetable,
      fees,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * STUDENT VIEW: Assignments (filterable by type)
 */
exports.getStudentAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // classwork/homework/assignment

    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid student id" });

    const ctx = await loadStudentContext(id);
    if (!ctx.ok) return res.status(ctx.status).json({ success: false, message: ctx.message });

    const q = {
      section: ctx.student.section._id,
      status: "published",
    };
    if (type) q.type = type;

    const assignments = await Assignment.find(q)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("subject", "name code")
      .populate("assignedBy", "fullName");

    res.status(200).json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * STUDENT VIEW: Resources shared by teacher (assignment resources) for the student's section
 */
exports.getStudentResources = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid student id" });

    const ctx = await loadStudentContext(id);
    if (!ctx.ok) return res.status(ctx.status).json({ success: false, message: ctx.message });

    const assignments = await Assignment.find({
      section: ctx.student.section._id,
      status: "published",
    }).select("_id title subject createdAt");

    const assignmentIds = assignments.map((a) => a._id);

    const resources = assignmentIds.length
      ? await AssignmentResource.find({ assignment: { $in: assignmentIds } })
          .sort({ createdAt: -1 })
          .populate("uploadedBy", "fullName")
          .populate({
            path: "assignment",
            select: "title subject type dueDate",
            populate: { path: "subject", select: "name code" },
          })
      : [];

    res.status(200).json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * STUDENT VIEW: Get my submission for an assignment
 */
exports.getMyAssignmentSubmission = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(assignmentId))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const ctx = await loadStudentContext(id);
    if (!ctx.ok) return res.status(ctx.status).json({ success: false, message: ctx.message });

    const submission = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      student: ctx.student._id,
    });

    res.status(200).json({ success: true, submission: submission || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * STUDENT VIEW: Upload/submit homework (upsert submission)
 * NOTE: This stores attachment metadata (url/name/type/size). Actual file hosting should be handled separately.
 */
exports.upsertAssignmentSubmission = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(assignmentId))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const ctx = await loadStudentContext(id);
    if (!ctx.ok) return res.status(ctx.status).json({ success: false, message: ctx.message });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ success: false, message: "Assignment not found" });

    // Ensure assignment belongs to student's section
    if (String(assignment.section) !== String(ctx.student.section._id)) {
      return res.status(403).json({ success: false, message: "Assignment not for your section" });
    }

    const { submissionText, attachments } = req.body || {};

    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const isLate = dueDate ? new Date() > dueDate : false;

    const update = {
      submissionText: submissionText || "",
      attachments: Array.isArray(attachments) ? attachments : [],
      status: isLate ? "late" : "submitted",
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignment: assignment._id, student: ctx.student._id },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Submission saved", submission });
  } catch (error) {
    // Duplicate key can happen in race conditions
    if (error && error.code === 11000) {
      return res.status(409).json({ success: false, message: "Submission already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * STUDENT VIEW: Fees summary
 */
exports.getStudentFees = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid student id" });

    const ctx = await loadStudentContext(id);
    if (!ctx.ok) return res.status(ctx.status).json({ success: false, message: ctx.message });

    const fees = await StudentFee.find({
      student: ctx.student._id,
      school: ctx.student.school._id,
    }).sort({ academicYearStart: -1 });

    res.status(200).json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * STUDENT VIEW: Past payments
 */
exports.getStudentFeePayments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid student id" });

    const ctx = await loadStudentContext(id);
    if (!ctx.ok) return res.status(ctx.status).json({ success: false, message: ctx.message });

    const payments = await FeePayment.find({
      student: ctx.student._id,
      school: ctx.student.school._id,
    })
      .sort({ receivedAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * STUDENT VIEW: Pay fees (creates payment record and updates StudentFee aggregates)
 */
exports.createStudentFeePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentFeeId, amount, method, reference, notes } = req.body || {};

    if (!isValidObjectId(id) || !isValidObjectId(studentFeeId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const ctx = await loadStudentContext(id);
    if (!ctx.ok) return res.status(ctx.status).json({ success: false, message: ctx.message });

    const fee = await StudentFee.findOne({
      _id: studentFeeId,
      student: ctx.student._id,
      school: ctx.student.school._id,
    });

    if (!fee) return res.status(404).json({ success: false, message: "Fee record not found" });

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ success: false, message: "amount must be > 0" });
    }
    if (payAmount > fee.remainingAmount) {
      return res.status(400).json({ success: false, message: "amount exceeds remaining amount" });
    }
    if (!method) {
      return res.status(400).json({ success: false, message: "method is required" });
    }

    const payment = await FeePayment.create({
      school: fee.school,
      student: fee.student,
      studentFee: fee._id,
      amount: payAmount,
      method,
      reference,
      notes,
      receivedAt: new Date(),
    });

    fee.paidAmount = (fee.paidAmount || 0) + payAmount;
    fee.remainingAmount = Math.max(0, (fee.remainingAmount || 0) - payAmount);
    fee.status = fee.remainingAmount === 0 ? "paid" : fee.paidAmount > 0 ? "partial" : "unpaid";
    fee.updatedAt = new Date();
    await fee.save();

    res.status(201).json({ success: true, message: "Payment recorded", payment, fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * STUDENT: Request half-day leave
 */
exports.requestHalfDay = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid student id" });

    const ctx = await loadStudentContext(id);
    if (!ctx.ok) return res.status(ctx.status).json({ success: false, message: ctx.message });

    const { date, halfDayType, reason } = req.body;
    if (!date || !halfDayType) {
      return res.status(400).json({ success: false, message: "Date and halfDayType are required" });
    }
    if (!["morning", "afternoon"].includes(halfDayType)) {
      return res.status(400).json({ success: false, message: "halfDayType must be 'morning' or 'afternoon'" });
    }

    const requestDate = new Date(date);
    requestDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestDate < today) {
      return res.status(400).json({ success: false, message: "Cannot request half-day for past dates" });
    }

    // Check if already requested
    const existing = await Leave.findOne({
      student: id,
      fromDate: { $lte: requestDate },
      toDate: { $gte: requestDate },
      isHalfDay: true,
      status: { $in: ["pending", "approved"] },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "Half-day already requested for this date" });
    }

    const halfDayRequest = await Leave.create({
      school: ctx.student.school._id,
      applicantType: "student",
      student: id,
      fromDate: requestDate,
      toDate: requestDate,
      reason: reason || "",
      isHalfDay: true,
      halfDayType,
      status: "pending",
    });

    res.status(201).json({ success: true, message: "Half-day request submitted", request: halfDayRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * STUDENT: Get my half-day requests
 */
exports.getMyHalfDayRequests = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid student id" });

    const requests = await Leave.find({
      student: id,
      isHalfDay: true,
    })
      .sort({ fromDate: -1 })
      .populate("verifiedBy", "fullName");

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
