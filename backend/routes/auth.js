const express = require("express");
const router = express.Router();
const { sendMagicLink, validateMagicLink } = require("../controllers/authController");

router.post("/login", sendMagicLink);
router.get("/verify", validateMagicLink); 

module.exports = router;
