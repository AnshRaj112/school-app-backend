const Section = require("../models/section");
const Teacher = require("../models/teacher");
const { isPrivileged } = require("../utils/authorization");
const {
  validateClass,
  validateSection,
  validateTeacher,
} = require("../utils/validators");

/**
 * Create Section (A, B, C)
 * POST /sections
 */
exports.createSection = async (req, res) => {
  try {
    const { actorId, schoolId, classId, name } = req.body;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    if (!schoolId || !classId || !name) {
      return res
        .status(400)
        .json({ message: "schoolId, classId and name are required" });
    }

    const cls = await validateClass(classId);
    if (!cls) return res.status(400).json({ message: "Invalid classId" });

    const section = await Section.create({
      schoolId,
      classId,
      name: name.trim(),
    });

    return res.status(201).json({
      message: "Section created successfully",
      section,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Section already exists for this class",
      });
    }

    return res.status(500).json({
      message: "Failed to create section",
      error: err.message,
    });
  }
};

/**
 * Get Sections by Class
 * GET /sections/by-class?actorId=&classId=
 */
exports.getSectionsByClass = async (req, res) => {
  try {
    const { actorId, classId } = req.query;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    // 1️⃣ Fetch sections (Academics cluster)
    const sections = await Section.find({
      classId,
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    if (!sections.length) {
      return res.json({ sections: [] });
    }

    // 2️⃣ Collect teacherIds
    const teacherIds = sections.map((s) => s.classTeacherId).filter(Boolean);

    let teacherMap = {};

    if (teacherIds.length) {
      // 3️⃣ Fetch teachers (Teacher cluster)
      const teachers = await Teacher.find(
        { _id: { $in: teacherIds } },
        { fullName: 1, email: 1 }
      ).lean();

      // 4️⃣ Build lookup map
      teacherMap = teachers.reduce((acc, t) => {
        acc[t._id.toString()] = t;
        return acc;
      }, {});
    }

    // 5️⃣ Attach teacher info manually
    const enrichedSections = sections.map((s) => ({
      ...s,
      classTeacher: s.classTeacherId
        ? teacherMap[s.classTeacherId.toString()] || null
        : null,
    }));

    return res.status(200).json({ sections: enrichedSections });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch sections",
      error: err.message,
    });
  }
};

/**
 * Assign Class Teacher
 * POST /sections/:id/assign-class-teacher
 */
exports.assignClassTeacher = async (req, res) => {
  try {
    const { actorId, teacherId } = req.body;
    const { id: sectionId } = req.params;

    const auth = await isPrivileged(actorId);
    if (!auth.ok) {
      return res.status(auth.status).json({ message: auth.message });
    }

    const section = await validateSection(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const teacher = await validateTeacher(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (
      teacher.schoolId &&
      section.schoolId &&
      teacher.schoolId.toString() !== section.schoolId.toString()
    ) {
      return res
        .status(400)
        .json({ message: "Teacher belongs to a different school" });
    }

    const existingClassTeacherSection = await Section.findOne({
      classTeacherId: teacherId,
      _id: { $ne: sectionId },
      isActive: true,
    });

    if (existingClassTeacherSection) {
      return res.status(409).json({
        message:
          "Teacher is already assigned as class teacher to another section",
        sectionId: existingClassTeacherSection._id,
      });
    }

    if (
      section.classTeacherId &&
      section.classTeacherId.toString() === teacherId
    ) {
      return res.json({
        message: "Teacher already assigned as class teacher to this section",
        section,
      });
    }

    const previousTeacherId = section.classTeacherId;

    section.classTeacherId = teacherId;
    await section.save();

    try {
      if (!teacher.roles.includes("class_teacher")) {
        teacher.roles.push("class_teacher");
      }

      if (Array.isArray(teacher.sections)) {
        if (!teacher.sections.some((s) => s.toString() === sectionId)) {
          teacher.sections.push(sectionId);
        }
      }

      await teacher.save();
    } catch (innerErr) {
      section.classTeacherId = previousTeacherId || null;
      await section.save();

      return res.status(500).json({
        message: "Failed to update teacher, changes rolled back",
        error: innerErr.message,
      });
    }

    return res.status(200).json({
      message: "Class teacher assigned successfully",
      section,
      teacher: {
        _id: teacher._id,
        fullName: teacher.fullName,
        roles: teacher.roles,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to assign class teacher",
      error: err.message,
    });
  }
};

/**
 * Unassign Class Teacher
 * POST /sections/:id/unassign-class-teacher
 */
exports.unassignClassTeacher = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id: sectionId } = req.params;

    const auth = await isPrivileged(actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    const section = await validateSection(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    if (!section.classTeacherId) {
      return res.status(400).json({ message: "No class teacher assigned" });
    }

    const teacherId = section.classTeacherId;
    section.classTeacherId = null;
    await section.save();

    try {
      const teacher = await Teacher.findById(teacherId);
      if (teacher && Array.isArray(teacher.sections)) {
        teacher.sections = teacher.sections.filter(
          (s) => s.toString() !== sectionId
        );
        await teacher.save();
      }
    } catch (cleanupErr) {
      console.error("Cleanup failed:", cleanupErr.message);
    }

    return res.json({
      message: "Class teacher unassigned",
      section,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to unassign class teacher",
      error: err.message,
    });
  }
};
