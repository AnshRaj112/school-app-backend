const express = require("express");
const router = express.Router();
const principalController = require("../controllers/principalController");

router.post("/create", principalController.createPrincipal);
router.put("/update/:id", principalController.updatePrincipal);

router.get("/fetch", principalController.getAllPrincipals);
router.get("/fetch/:id", principalController.getPrincipalById);

module.exports = router;
