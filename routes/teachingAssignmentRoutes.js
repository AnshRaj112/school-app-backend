const express = require("express");
const router = express.Router();
const teachingAssignmentController = require("../controllers/teachingAssignmentController");

router.post("/", teachingAssignmentController.createAssignment);
router.get("/by-section", teachingAssignmentController.getBySection);
router.get("/by-class", teachingAssignmentController.getByClass);
router.get("/by-teacher", teachingAssignmentController.getByTeacher);
router.put("/:id/replace-teacher", teachingAssignmentController.replaceTeacher);
router.put("/:id/status", teachingAssignmentController.updateAssignmentStatus);

module.exports = router;
