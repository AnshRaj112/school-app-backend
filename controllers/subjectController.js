const Subject = require("../models/subject");
const Admin = require("../models/admin");
const Principal = require("../models/principal");
const Section = require("../models/section");
const Teacher = require("../models/teacher");

/**
 * Utility: check actor permission
 */
async function isAllowed(actorId) {
  const admin = await Admin.findById(actorId);
  if (admin && admin.role === "super_admin") return true;

  const principal = await Principal.findById(actorId);
  if (principal && principal.isActive) return true;

  return false;
}

/**
 * Create Subject
 */
exports.createSubject = async (req, res) => {
  try {
    const { actorId, school, name, code } = req.body;

    if (!(await isAllowed(actorId))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const subject = new Subject({ school, name, code });
    await subject.save();

    return res.status(201).json({
      message: "Subject created",
      subject: {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        school: subject.school,
        isActive: subject.isActive,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * Update Subject
 */
exports.updateSubject = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;

    if (!(await isAllowed(actorId))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = req.body;
    const subject = await Subject.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!subject) return res.status(404).json({ message: "Subject not found" });

    return res.status(200).json({
      message: "Subject updated",
      subject: {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        school: subject.school,
        isActive: subject.isActive,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * Get All Subjects (by school if given)
 */
exports.getAllSubjects = async (req, res) => {
  try {
    const { actorId, school } = req.body;

    if (!(await isAllowed(actorId))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const query = school ? { school } : {};
    const subjects = await Subject.find(query).select(
      "name code school isActive"
    );

    return res.status(200).json({ subjects });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * Get Subject by ID
 */
exports.getSubjectById = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;

    if (!(await isAllowed(actorId))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const subject = await Subject.findById(id)
      .populate("teachers", "fullName email")
      .populate("sections", "grade name");

    if (!subject) return res.status(404).json({ message: "Subject not found" });

    return res.status(200).json({
      subject: {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        school: subject.school,
        teachers: subject.teachers,
        sections: subject.sections,
        isActive: subject.isActive,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * Delete Subject
 */
exports.deleteSubject = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;

    if (!(await isAllowed(actorId))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    return res.status(200).json({ message: "Subject deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * Assign Subject to Teacher
 */
exports.assignSubjectToTeacher = async (req, res) => {
  try {
    const { actorId, subjectId, teacherId } = req.body;

    if (!(await isAllowed(actorId))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const subject = await Subject.findById(subjectId);
    const teacher = await Teacher.findById(teacherId);

    if (!subject || !teacher) {
      return res.status(404).json({ message: "Subject or Teacher not found" });
    }

    if (!subject.teachers.includes(teacherId)) {
      subject.teachers.push(teacherId);
      await subject.save();
    }
    if (!teacher.subjects.includes(subjectId)) {
      teacher.subjects.push(subjectId);
      await teacher.save();
    }

    return res.status(200).json({ message: "Subject assigned to teacher" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * Assign Subject to Section
 */
exports.assignSubjectToSection = async (req, res) => {
  try {
    const { actorId, subjectId, sectionId } = req.body;

    if (!(await isAllowed(actorId))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const subject = await Subject.findById(subjectId);
    const section = await Section.findById(sectionId);

    if (!subject || !section) {
      return res.status(404).json({ message: "Subject or Section not found" });
    }

    // Initialize arrays if undefined
    subject.sections = subject.sections || [];
    section.subjects = section.subjects || [];

    if (!subject.sections.includes(sectionId)) {
      subject.sections.push(sectionId);
      await subject.save();
    }

    if (!section.subjects.includes(subjectId)) {
      section.subjects.push(subjectId);
      await section.save();
    }

    return res.status(200).json({
      message: "Subject assigned to section successfully",
      subjectId,
      sectionId,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
