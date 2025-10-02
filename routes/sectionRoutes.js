const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");

// CRUD
router.post("/create", sectionController.createSection);
router.get("/get", sectionController.getSections);
router.put("/update", sectionController.updateSection);
router.delete("/delete", sectionController.deleteSection);

// Assign Teacher
router.put("/assign-teacher", sectionController.assignTeacher);
router.put("/remove-teacher", sectionController.removeClassTeacher);
module.exports = router;
