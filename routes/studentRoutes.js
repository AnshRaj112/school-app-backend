const express = require("express");
const router = express.Router();
const studentCtrl = require("../controllers/studentController");

// Create student
router.post("/", studentCtrl.createStudent);

// Get all students (with filters)
router.get("/", studentCtrl.getAllStudents);

// Get single student
router.get("/:id", studentCtrl.getStudentById);

// Update student
router.put("/:id", studentCtrl.updateStudent);

// Delete student
router.delete("/:id", studentCtrl.deleteStudent);

module.exports = router;
