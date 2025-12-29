const Student = require("../models/student");
const Section = require("../models/section");
const School = require("../models/school");
const Class = require("../models/class");

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
