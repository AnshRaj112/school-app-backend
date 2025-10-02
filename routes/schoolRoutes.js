const express = require("express");
const router = express.Router();
const schoolController = require("../controllers/schoolController");

// Create School (Super Admin)
router.post("/", schoolController.createSchool);

// Get All Schools (Super Admin)
router.get("/", schoolController.getAllSchools);

// Get One School (Super Admin or Admin)
router.get("/:id", schoolController.getSchoolById);

// Update School (Super Admin or Admin)
router.put("/:id", schoolController.updateSchool);

// Delete School (Super Admin only)
router.delete("/:id", schoolController.deleteSchool);

module.exports = router;
