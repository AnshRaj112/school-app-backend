const express = require("express");
const router = express.Router();

// Import controller object
const timetableController = require("../controllers/timetableController");

// GET timetable
router.get("/:schoolId/timetables", timetableController.getTimetable);

// POST timetable
router.post("/:schoolId/timetables", timetableController.createTimetable);

module.exports = router;

router.patch(
  "/:schoolId/timetables/:id",
  timetableController.updateTimetable
);
