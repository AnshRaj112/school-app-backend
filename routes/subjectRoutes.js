const express = require("express");
const router = express.Router();
const subjectCtrl = require("../controllers/subjectController");

// Create subject
router.post("/", subjectCtrl.createSubject);

// Get subjects by class
router.get("/", subjectCtrl.getSubjectsByClass);

// Update subject
router.put("/:id", subjectCtrl.updateSubject);

// Activate / Deactivate subject
router.put("/:id/status", subjectCtrl.toggleSubjectStatus);

// Get subjects by school (optional)
router.get("/by-school", subjectCtrl.getSubjectsBySchool);

module.exports = router;
