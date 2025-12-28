const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

router.post("/", teacherController.createTeacher);
router.get("/by-school", teacherController.getTeachersBySchool);
router.get("/eligible", teacherController.getEligibleTeachers);
router.get("/:id", teacherController.getTeacherById);
router.put("/:id", teacherController.updateTeacher);
router.put("/:id/status", teacherController.updateTeacherStatus);

module.exports = router;
