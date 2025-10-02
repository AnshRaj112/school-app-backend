const express = require("express");
const router = express.Router();
const TeacherController = require("../controllers/teacherController");

router.post("/", TeacherController.createTeacher); // no ()
router.put("/:id", TeacherController.updateTeacher);
router.get("/", TeacherController.getAllTeachers);
router.get("/:id", TeacherController.getTeacherById);
router.delete("/:id", TeacherController.deleteTeacher);
router.post("/:id/assign-section", TeacherController.assignSectionToTeacher);

module.exports = router;
