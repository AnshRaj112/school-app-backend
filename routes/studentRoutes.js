const express = require("express");
const router = express.Router();
const studentCtrl = require("../controllers/studentController");

// Create student
router.post("/", studentCtrl.createStudent);

// Get all students (with filters)
router.get("/", studentCtrl.getAllStudents);

// Student dashboard (student view)
router.get("/:id/dashboard", studentCtrl.getStudentDashboard);

// Fees (student view)
router.get("/:id/fees", studentCtrl.getStudentFees);
router.get("/:id/fees/payments", studentCtrl.getStudentFeePayments);
router.post("/:id/fees/payments", studentCtrl.createStudentFeePayment);

// Assignments / classwork / homework (student view)
router.get("/:id/assignments", studentCtrl.getStudentAssignments);
router.get("/:id/resources", studentCtrl.getStudentResources);
router.post(
  "/:id/assignments/:assignmentId/submission",
  studentCtrl.upsertAssignmentSubmission
);
router.get(
  "/:id/assignments/:assignmentId/submission",
  studentCtrl.getMyAssignmentSubmission
);

// Get single student
router.get("/:id", studentCtrl.getStudentById);

// Update student
router.put("/:id", studentCtrl.updateStudent);

// Delete student
router.delete("/:id", studentCtrl.deleteStudent);

module.exports = router;
