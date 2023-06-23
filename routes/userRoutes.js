const express = require("express");
const controller = require("../controllers/userController");
const {
    isGuest,
    isLoggedIn,
    validateSignUp,
    validateLogIn,
    validateResult,
} = require("../middlewares/validator");

const router = express.Router();

router.get("/new", isGuest, controller.new);

router.post("/", isGuest,validateSignUp,validateResult, controller.create);

router.get("/login", isGuest, controller.getUserLogin);

router.post("/login", isGuest, validateLogIn,validateResult,controller.login);

router.get("/cart", isLoggedIn, controller.cart);

router.get("/logout", isLoggedIn, controller.logout);

module.exports = router;
