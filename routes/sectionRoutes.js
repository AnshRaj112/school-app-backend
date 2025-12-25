const express = require("express");
const router = express.Router();
const sectionCtrl = require("../controllers/sectionController");

// Create section
router.post("/", sectionCtrl.createSection);

// Get sections by class
//router.get("/", sectionCtrl.getSectionsByClass);
router.get("/by-class", sectionCtrl.getSectionsByClass);

// Assign / Unassign class teacher
router.post("/:id/assign-class-teacher", sectionCtrl.assignClassTeacher);
router.post("/:id/unassign-class-teacher", sectionCtrl.unassignClassTeacher);

module.exports = router;
