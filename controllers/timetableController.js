// controllers/timetableController.js

/**
 * GET timetable (test version)
 */
const getTimetable = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Timetable GET API working 🚀",
  });
};

/**
 * POST timetable (test version)
 */
const Timetable = require("../models/timetable");

/**
 * POST TIMETABLE
 * Save a timetable entry in DB
 */
const createTimetable = async (req, res) => {
  try {
    // 1. Read schoolId from URL
    const { schoolId } = req.params;

    // 2. Read data from request body
    const {
      sectionId,
      subjectId,
      teacherId,
      dayOfWeek,
      startMinute,
      endMinute,
    } = req.body;

    // 3. Basic validation (VERY IMPORTANT)
    if (
      !sectionId ||
      !subjectId ||
      !teacherId ||
      !dayOfWeek ||
      !startMinute ||
      !endMinute
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 4. Create timetable document
    const timetable = new Timetable({
      schoolId,
      sectionId,
      subjectId,
      teacherId,
      dayOfWeek,
      startMinute,
      endMinute,
    });

    // Check section clash
const sectionClash = await Timetable.findOne({
  schoolId,
  sectionId,
  dayOfWeek,
  startMinute: { $lt: endMinute },
  endMinute: { $gt: startMinute },
});

if (sectionClash) {
  return res.status(409).json({
    success: false,
    message: "Section already has a class in this time slot",
  });
}

// Check teacher clash
const teacherClash = await Timetable.findOne({
  schoolId,
  teacherId,
  dayOfWeek,
  startMinute: { $lt: endMinute },
  endMinute: { $gt: startMinute },
});

if (teacherClash) {
  return res.status(409).json({
    success: false,
    message: "Teacher already assigned in this time slot",
  });
}

    // 5. Save to MongoDB
    const savedTimetable = await timetable.save();

    // 6. Send response
    res.status(201).json({
      success: true,
      message: "Timetable saved successfully",
      data: savedTimetable,
    });
  }catch (error) {
  console.error("Error saving timetable:", error);

  res.status(500).json({
    success: false,
    message: "Failed to save timetable",
  });
}


  }
const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Timetable.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Timetable updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update timetable error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update timetable",
    });
  }
};
const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Timetable.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    console.error("Delete timetable error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete timetable",
    });
  }
};

module.exports = {
  getTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable,
};

