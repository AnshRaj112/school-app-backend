const express = require("express");
const router = express.Router();
const classCtrl = require("../controllers/classControllers");

// Create class
router.post("/", classCtrl.createClass);

// Get classes by school
router.get("/", classCtrl.getClassesBySchool);

// Update class
router.put("/:id", classCtrl.updateClass);

// Delete (soft)
router.delete("/:id", classCtrl.deleteClass);

// Toggle activate/deactivate
router.put("/:id/status", classCtrl.toggleClassStatus);

module.exports = router;
