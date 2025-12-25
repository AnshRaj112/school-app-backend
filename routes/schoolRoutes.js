const express = require("express");
const router = express.Router();
const schoolController = require("../controllers/schoolController");

router.post("/create", schoolController.createSchool);
router.get("/fetch", schoolController.getAllSchools);
router.get("/fetch/:id", schoolController.getSchoolById);
router.put("/update/:id", schoolController.updateSchool);
router.delete("/delete/:id", schoolController.deleteSchool);

module.exports = router;
