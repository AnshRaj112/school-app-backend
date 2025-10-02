const Teacher = require("../models/teacher");
const Admin = require("../models/admin");
const School = require("../models/school");
const Section = require("../models/section");

/**
 * Create a new Teacher
 * Only super_admin or principal can create
 */
exports.createTeacher = async (req, res) => {
  try {
    const { actorId, username, fullName, email, password, school, roles } =
      req.body;

    if (!username || !fullName || !email || !password || !school) {
      return res.status(400).json({
        message: "username, fullName, email, password and school are required",
      });
    }

    const actor = await Admin.findById(actorId);
    if (
      !actor ||
      (actor.role !== "super_admin" && actor.role !== "principal")
    ) {
      return res
        .status(403)
        .json({ message: "Only Super Admin or Principal can create teachers" });
    }

    const existing = await Teacher.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const schoolExists = await School.findById(school);
    if (!schoolExists) {
      return res.status(400).json({ message: "Invalid school ID" });
    }

    const teacher = new Teacher({
      username,
      fullName,
      email,
      password,
      school,
      roles: roles || ["subject_teacher"],
    });

    await teacher.save();

    return res.status(201).json({
      message: "Teacher created successfully",
      teacher: {
        _id: teacher._id,
        username: teacher.username,
        fullName: teacher.fullName,
        email: teacher.email,
        roles: teacher.roles,
        school: {
          _id: schoolExists._id,
          name: schoolExists.name,
          code: schoolExists.code,
        },
        isActive: teacher.isActive,
        createdAt: teacher.createdAt,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Update Teacher
 * Only super_admin or principal
 */
exports.updateTeacher = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;
    const updates = req.body;

    const actor = await Admin.findById(actorId);
    if (
      !actor ||
      (actor.role !== "super_admin" && actor.role !== "principal")
    ) {
      return res
        .status(403)
        .json({ message: "Only Super Admin or Principal can update teachers" });
    }

    // Validate school if being updated
    if (updates.school) {
      const schoolExists = await School.findById(updates.school);
      if (!schoolExists) {
        return res.status(400).json({ message: "Invalid school ID" });
      }
    }

    const teacher = await Teacher.findByIdAndUpdate(id, updates, { new: true });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json({
      message: "Teacher updated successfully",
      teacher: {
        _id: teacher._id,
        username: teacher.username,
        fullName: teacher.fullName,
        email: teacher.email,
        roles: teacher.roles,
        school: teacher.school,
        isActive: teacher.isActive,
        updatedAt: teacher.updatedAt,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Get All Teachers
 */
exports.getAllTeachers = async (req, res) => {
  try {
    const { actorId, school } = req.body;
    const actor = await Admin.findById(actorId);
    if (
      !actor ||
      (actor.role !== "super_admin" && actor.role !== "principal")
    ) {
      return res
        .status(403)
        .json({ message: "Only Super Admin or Principal can view teachers" });
    }

    const filter = school ? { school } : {};
    const teachers = await Teacher.find(filter).select(
      "_id username fullName email roles school isActive createdAt updatedAt"
    );

    return res.status(200).json({ teachers });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Get Teacher by ID
 */
exports.getTeacherById = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;
    const actor = await Admin.findById(actorId);
    if (
      !actor ||
      (actor.role !== "super_admin" && actor.role !== "principal")
    ) {
      return res
        .status(403)
        .json({ message: "Only Super Admin or Principal can view teacher" });
    }

    const teacher = await Teacher.findById(id).select(
      "_id username fullName email roles school isActive createdAt"
    );
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json({ teacher });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete Teacher
 */
exports.deleteTeacher = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;
    const actor = await Admin.findById(actorId);
    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can delete teacher" });
    }

    await Teacher.findByIdAndDelete(id);
    return res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Assign Section to Teacher
 */
exports.assignSectionToTeacher = async (req, res) => {
  try {
    const { actorId, sectionId } = req.body;
    const { id } = req.params;
    const actor = await Admin.findById(actorId);
    if (
      !actor ||
      (actor.role !== "super_admin" && actor.role !== "principal")
    ) {
      return res
        .status(403)
        .json({ message: "Only Super Admin or Principal can assign section" });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (!teacher.sections.includes(sectionId)) {
      teacher.sections.push(sectionId);
      await teacher.save();
    }

    return res.status(200).json({ message: "Section assigned successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
