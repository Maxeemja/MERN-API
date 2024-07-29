const express = require("express");

const router = express.Router();
const { getUsers, signup, login } = require("../controllers/users-controller");
const { check } = require("express-validator");

router.get("/", getUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  signup,
);

router.post("/login", login);

module.exports = router;
