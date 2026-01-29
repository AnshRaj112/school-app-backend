const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

router.post("/", teacherController.createTeacher);
router.get("/by-school", teacherController.getTeachersBySchool);
router.get("/eligible", teacherController.getEligibleTeachers);
router.get("/:id", teacherController.getTeacherById);
router.put("/:id", teacherController.updateTeacher);
router.put("/:id/status", teacherController.updateTeacherStatus);

// Half-day requests (teacher view)
router.get("/half-day-requests/pending", teacherController.getPendingHalfDayRequests);
router.put("/half-day-requests/:requestId/verify", teacherController.verifyHalfDayRequest);

module.exports = router;
