const express = require("express");
const router = express.Router();
const substitutionController = require("../controllers/substitutionController");

router.post("/", substitutionController.createSubstitution);
router.get("/by-date", substitutionController.getByDate);
router.get("/by-section", substitutionController.getBySection);
router.get("/available-teachers", substitutionController.getAvailableTeachers);
router.put("/:id/status", substitutionController.updateSubstitutionStatus);

module.exports = router;
