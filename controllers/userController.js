const model = require("../models/user");
const Trade = require("../models/trade");
exports.new = (req, res) => {
  res.render("./user/new");
};

exports.create = (req, res, next) => {
  let user = new model(req.body); //create a new user document
  if (user.email) {
    user.email = user.email.toLowerCase();
  }
  user
    .save() //insert the document to the database
    .then((user) => {
      req.flash("success", "Successfully created account");
      res.redirect("/users/login");
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("back");
      }

      if (err.code === 11000) {
        req.flash("error", "Email has been used");
        return res.redirect("back");
      }

      next(err);
    });
};

exports.getUserLogin = (req, res, next) => {
  res.render("./user/login");
};

exports.login = (req, res, next) => {
  let email = req.body.email;
  if (email) {
    email = email.toLowerCase();
  }
  let password = req.body.password;
  model
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "wrong email address");
        res.redirect("/users/login");
      } else {
        user.comparePassword(password).then((result) => {
          if (result) {
            req.session.user = user._id;
            req.flash("success", "Welcome back !" + user.lastName);
            res.redirect("/users/cart");
          } else {
            req.flash("error", "Wrong password");
            res.redirect("/users/login");
          }
        });
      }
    })
    .catch((err) => next(err));
};

exports.cart = (req, res, next) => {
  let id = req.session.user;
  Promise.all([
    model.findById(id),
    Trade.find({ owner: id }).populate("offerItem", "id title image"),
    Trade.find({ watchHistory: id }).select("title category status"),
    Trade.find({ offerItemOwner: id })
      .populate("offerItem", "title image category status")
      .select("title category status offerItem")
  ])
    .then((results) => {
      const [user, trades, wishlist, offers] = results;
      res.render("./user/cart", { user, trades, wishlist, offers });
    })
    .catch((err) => next(err));
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    else res.redirect("/");
  });
};
