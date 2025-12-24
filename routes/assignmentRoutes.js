// routes/teacherAssignmentRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/teacherAssignmentController.js");

// Lifecycle
router.post("/", ctrl.createAssignment);
router.patch("/:id", ctrl.updateAssignment);
router.patch("/:id/publish", ctrl.publishAssignment);
router.patch("/:id/archive", ctrl.archiveAssignment);
router.delete("/:id", ctrl.deleteAssignment);

// Queries
router.get("/", ctrl.listAssignments);
router.get("/:id", ctrl.getAssignmentDetail);
router.get("/:id/availability", ctrl.getAssignmentAvailability);

module.exports = router;
