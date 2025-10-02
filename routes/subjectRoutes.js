const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");

// CRUD
router.post("/create", subjectController.createSubject);
router.put("/update/:id", subjectController.updateSubject);
router.get("/all", subjectController.getAllSubjects);
router.get("/:id", subjectController.getSubjectById);
router.delete("/:id", subjectController.deleteSubject);

// Assign operations
router.post("/assign/teacher", subjectController.assignSubjectToTeacher);
router.post("/assign/section", subjectController.assignSubjectToSection);

module.exports = router;
