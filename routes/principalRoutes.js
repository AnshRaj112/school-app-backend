const express = require("express");
const router = express.Router();
const principalController = require("../controllers/principalController");

// Create a Principal
router.post("/", principalController.createPrincipal);

// Update a Principal
router.put("/:id", principalController.updatePrincipal);

// Get all Principals
router.get("/", principalController.getAllPrincipals);

// Get Principal by ID
router.get("/:id", principalController.getPrincipalById);

module.exports = router;
