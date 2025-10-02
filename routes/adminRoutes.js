const express = require("express");
const router = express.Router();
const { createAdmin } = require("../controllers/adminControllers");

// Create admin
router.post("/create", createAdmin);

module.exports = router;
