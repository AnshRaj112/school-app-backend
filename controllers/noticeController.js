const Notice = require("../models/notice");
const Student = require("../models/student");
const Section = require("../models/section");
const Class = require("../models/class");
const mongoose = require("mongoose");

/**
 * Get notices for a student (filtered by their section/class)
 */
exports.getStudentNotices = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid student id" });
    }

    const student = await Student.findById(studentId)
      .populate("school")
      .populate({
        path: "section",
        populate: { path: "classId" },
      });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const now = new Date();
    const finalQuery = {
      school: student.school._id,
      isActive: true,
      $or: [
        { targetAudience: "all" },
        ...(student.section?._id ? [{ targetSection: student.section._id }] : []),
        ...(student.section?.classId?._id ? [{ targetClass: student.section.classId._id }] : []),
      ],
      $and: [
        {
          $or: [
            { expiryDate: { $exists: false } },
            { expiryDate: null },
            { expiryDate: { $gte: now } },
          ],
        },
      ],
    };

    const notices = await Notice.find(finalQuery)
      .sort({ priority: -1, createdAt: -1 })
      .limit(50);

    res.json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create notice (for teachers/principals)
 */
exports.createNotice = async (req, res) => {
  try {
    const {
      schoolId,
      title,
      content,
      postedBy,
      postedByType,
      postedByName,
      priority = "normal",
      targetAudience = "all",
      targetSection,
      targetClass,
      targetSubject,
      expiryDate,
    } = req.body;

    if (!title || !content || !postedBy || !postedByType || !postedByName) {
      return res.status(400).json({
        success: false,
        message: "Title, content, postedBy, postedByType, and postedByName are required",
      });
    }

    const notice = await Notice.create({
      school: schoolId,
      title,
      content,
      postedBy,
      postedByType,
      postedByName,
      priority,
      targetAudience,
      targetSection,
      targetClass,
      targetSubject,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    res.status(201).json({ success: true, message: "Notice created", notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all notices (for admin/principal view)
 */
exports.getAllNotices = async (req, res) => {
  try {
    const { schoolId, isActive } = req.query;
    const query = {};
    if (schoolId) query.school = schoolId;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const notices = await Notice.find(query)
      .populate("targetSection", "name")
      .populate("targetClass", "grade")
      .populate("targetSubject", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update notice
 */
exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    const notice = await Notice.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    res.json({ success: true, message: "Notice updated", notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete/Deactivate notice
 */
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    res.json({ success: true, message: "Notice deactivated", notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

