const { check } = require("express-validator");
const { validationResult } = require("express-validator");
const Trade = require("../models/trade");
//check if the user is a guest
exports.isGuest = (req, res, next) => {
  if (!req.session.user) {
    return next();
  } else {
    req.flash("error", "You are already logged in");
    return res.redirect("/users/cart");
  }
};

//check if the user is Authenticated
exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    req.flash("error", "You need to Login");
    return res.redirect("/users/login");
  }
};

//check if the user is owner of the trade
exports.isOwner = (req, res, next) => {
  let id = req.params.id;
  Trade.findById(id)
    .then((trade) => {
      if (trade) {
        if (trade.owner == req.session.user) {
          return next();
        } else {
          let err = new Error("Unauthorized to access the resource");
          err.status = 401;
          req.flash("error", err.message);
          return res.redirect("/");
        }
      }
    })
    .catch((err) => next(err));
};

//an objectId is a 24-bit Hex string
exports.validateId = (req, res, next) => {
  let id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    let err = new Error("Invalid trade id");
    err.status = 400;
    req.flash("error", err.message);
    return res.redirect("/");
  } else {
    return next();
  }
};

exports.validateSignUp = [
  check("firstName", "First name cannot be empty").notEmpty().trim().escape(),
  check("lastName", "Last name cannot be empty").notEmpty().trim().escape(),
  check("email", "Email must be a valid email")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  check(
    "password",
    "Password must be atleast 8 characters and atmost 64 characters"
  ).isLength({ min: 8, max: 64 }),
];

exports.validateLogIn = [
  check("email", "Email must be a valid email")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  check(
    "password",
    "Password must be atleast 8 characters and atmost 64 characters"
  ).isLength({ min: 8, max: 64 }),
];

exports.validateResult = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });
    return res.redirect("back");
  } else {
    return next();
  }
};

exports.validateTrade = [
  check("title", "Outfit Title cannot be empty").notEmpty().trim().escape(),
  check("category")
    .notEmpty()
    .withMessage("Outfit Category cannot be empty ")
    .bail()
    .isAlphanumeric(["en-US"], { ignore: " " })
    .withMessage("Outfit Category can contain only Alphabets and Numbers")
    .trim()
    .escape(),
  check("details")
    .isLength({ min: 10, max: 200 })
    .withMessage(
      "Outfit Details must be atleast 10 characters and atmost 200 characters"
    )
    .trim()
    .escape(),
  check("gender")
    .exists()
    .withMessage("Gender must exist")
    .bail()
    .isIn(["Men", "Women"])
    .withMessage("Invalid Gender choosen among [Men, Women]"),
  check("size")
    .exists()
    .withMessage("Size must exist")
    .bail()
    .isIn(["XS", "S", "M", "L", "XL"])
    .withMessage("Invalid Size choosen among [XS, S, M, L, XL]"),
  check("contents").trim().escape(),
  check("image", "Invalid Outfit Image URL").default("https://iili.io/paBLIn.png").isURL().trim(),
];

//check if the user is not owner of the trade
exports.isNotOwner = (req, res, next) => {
  let id = req.params.id;
  Trade.findById(id)
    .then((trade) => {
      if (trade) {
        if (trade.owner == req.session.user) {
          let err = new Error("Invalid request you cannot trade your own item");
          err.status = 401;
          req.flash("error", err.message);
          return res.redirect("/users/cart");
        } else {
          return next();
        }
      }
    })
    .catch((err) => next(err));
};
//check if the user is not owner of the trade
exports.vailidTrade = (req, res, next) => {
  let id = req.body.tradeItem;
  Trade.findById(id)
    .then((trade) => {
      if (trade) {
        if (trade.owner == req.session.user && trade.status==='Available') {
          return next();
        } else {
          let err = new Error("Unauthorized to access the resource");
          err.status = 401;
          req.flash("error", err.message);
          return res.redirect("/");
        }
      } else {
        let err = new Error("Invalid Trading item id");
        err.status = 401;
        req.flash("error", err.message);
        return res.redirect("/users/cart");
      }
    })
    .catch((err) => next(err));
};
exports.validateCancel=(req,res,next)=>{
  
}

exports.canCancel=(req,res,next)=>{
  let tradeItemId=req.params.tradeItemId;
  let itemId=req.params.itemId;
  Promise.all([
      Trade.findById(tradeItemId),
      Trade.findById(itemId)
    ]).then((results) => {
      const [tradeItem, item] = results;
      if(tradeItem.owner==req.session.user || item.owner==req.session.user){
         return next();
      }else{
          let err = new Error("Invalid request you cannot trade your own item");
          err.status = 401;
          req.flash("error", err.message);
          return res.redirect("/users/cart");
      }
    })
    .catch(err=>next(err));
}

exports.canAccept=(req,res,next)=>{
  let itemId=req.params.itemId;

      Trade.findById(itemId)
    .then((item) => {
      if(item.owner==req.session.user){
         return next();
      }else{
          let err = new Error("Invalid request you cannot accept others item");
          err.status = 401;
          req.flash("error", err.message);
          return res.redirect("/users/cart");
      }
    })
    .catch(err=>next(err));
}