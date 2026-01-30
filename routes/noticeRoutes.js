const express = require("express");
const router = express.Router();
const noticeCtrl = require("../controllers/noticeController");

// Get notices for a student
router.get("/student/:studentId", noticeCtrl.getStudentNotices);

// Get all notices (admin/principal view)
router.get("/", noticeCtrl.getAllNotices);

// Create notice
router.post("/", noticeCtrl.createNotice);

// Update notice
router.put("/:id", noticeCtrl.updateNotice);

// Delete/Deactivate notice
router.delete("/:id", noticeCtrl.deleteNotice);

module.exports = router;

