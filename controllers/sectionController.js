const Section = require("../models/section");
const Admin = require("../models/admin");
const Principal = require("../models/principal");
const Teacher = require("../models/teacher");
const Subject = require("../models/subject");

// Utility: check if actor is superadmin or principal
async function authorize(actorId) {
  const admin = await Admin.findById(actorId);
  if (admin && admin.role === "super_admin") return "super_admin";

  const principal = await Principal.findById(actorId);
  if (principal && principal.isActive) return "principal";

  return null;
}

// ✅ Create Section
exports.createSection = async (req, res) => {
  try {
    const { actorId, school, grade, name } = req.body;

    const role = await authorize(actorId);
    if (!role) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const section = new Section({ school, grade, name });
    await section.save();

    return res.status(201).json({
      message: "Section created successfully",
      section: { id: section._id, school, grade, name },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all sections for a school
exports.getSections = async (req, res) => {
  try {
    const { actorId, schoolId } = req.body;

    const role = await authorize(actorId);
    if (!role) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const sections = await Section.find({ school: schoolId }).select(
      "grade name classTeacher isActive"
    );

    return res.status(200).json({ sections });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ✅ Update Section (not teacher)
exports.updateSection = async (req, res) => {
  try {
    const { actorId, sectionId, grade, name, isActive } = req.body;

    const role = await authorize(actorId);
    if (!role) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { grade, name, isActive, updatedAt: Date.now() },
      { new: true }
    ).select("grade name isActive");

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    return res.status(200).json({ message: "Section updated", section });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete Section
exports.deleteSection = async (req, res) => {
  try {
    const { actorId, sectionId } = req.body;

    const role = await authorize(actorId);
    if (!role) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const section = await Section.findByIdAndDelete(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    return res.status(200).json({ message: "Section deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ✅ Assign Class Teacher
exports.assignTeacher = async (req, res) => {
  try {
    const { actorId, sectionId, teacherId } = req.body;

    const role = await authorize(actorId);
    if (!role) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 🔹 Update Section with new classTeacher
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { classTeacher: teacherId, updatedAt: Date.now() },
      { new: true }
    ).select("grade name classTeacher");

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // 🔹 Update Teacher: add role + section if missing
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Ensure "class_teacher" role exists
    if (!teacher.roles.includes("class_teacher")) {
      teacher.roles.push("class_teacher");
    }

    // Ensure sectionId exists in teacher.sections
    if (!teacher.sections.some((id) => id.toString() === sectionId)) {
      teacher.sections.push(sectionId);
    }

    await teacher.save();

    return res.status(200).json({
      message: "Class teacher assigned successfully",
      section,
      teacher: {
        id: teacher._id,
        fullName: teacher.fullName,
        roles: teacher.roles,
        sections: teacher.sections,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ✅ Disassign Class Teacher from Section
exports.removeClassTeacher = async (req, res) => {
  try {
    const { actorId, sectionId } = req.body;

    const role = await authorize(actorId);
    if (!role) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    if (!section.classTeacher) {
      return res
        .status(400)
        .json({ message: "No class teacher assigned to this section" });
    }

    const teacherId = section.classTeacher;
    const teacher = await Teacher.findById(teacherId);

    if (teacher) {
      // Remove "class_teacher" role
      teacher.roles = teacher.roles.filter((r) => r !== "class_teacher");

      // Check if teacher teaches any subject in this section
      const subjectTaught = await Subject.findOne({
        teachers: teacher._id,
        sections: sectionId,
      });

      if (!subjectTaught) {
        // If they don't teach any subject here → remove section reference
        teacher.sections = teacher.sections.filter(
          (s) => s.toString() !== sectionId
        );
      }

      await teacher.save();
    }

    // ✅ Remove from section
    section.classTeacher = null;
    await section.save();

    return res.status(200).json({
      message: "Class teacher removed successfully",
      section: {
        id: section._id,
        name: section.name,
        grade: section.grade,
        classTeacher: null,
      },
      teacher: teacher
        ? {
            id: teacher._id,
            fullName: teacher.fullName,
            roles: teacher.roles,
            sections: teacher.sections,
          }
        : null,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
