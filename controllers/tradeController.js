const model = require("../models/trade");
const userModel = require("../models/user");

exports.index = (req, res, next) => {
  model
    .find()
    .then((trades) => {
      let categories = new Set();
      trades.forEach((trade) => {
        categories.add(trade["category"]);
      });
      res.render("./trade/index", { trades, categories });
    })
    .catch((err) => next(err));
};

exports.new = (req, res) => {
  res.render("./trade/newTrade");
};

exports.create = (req, res, next) => {
  let trade = new model(req.body);
  trade.owner = req.session.user;
  trade.status = "Available";
  trade
    .save()
    .then((t) => res.redirect("/trades"))
    .catch((err) => {
      if (err.name === "ValidationError") {
        err.status = 400;
        req.flash("error", err.message);
        return res.redirect("back");
      }
      console.log(err);
      next(err);
    });
};

exports.show = (req, res, next) => {
  let id = req.params.id;
  model
    .findById(id)
    .populate("owner", "firstName lastName")
    .then((trade) => {
      if (trade) {
        let isWatchable = true;
        if (trade.watchHistory.includes(req.session.user)) {
          isWatchable = false;
        }
        let reviews=trade.reviews;
        res.render("./trade/trade", { trade, isWatchable,reviews });
      } else {
        let err = new Error("Cannot find a Outfit with id: " + id);
        err.status = 404;
        req.flash("error", err.message);
        return res.redirect("/users/cart");
      }
    })
    .catch((err) => next(err));
};

exports.edit = (req, res, next) => {
  let id = req.params.id;
  model
    .findById(id)
    .then((trade) => {
      if (trade) {
        res.render("./trade/editTrade", { trade });
      } else {
        let err = new Error("Cannot find Outfit with id: " + id);
        err.status = 404;
        req.flash("error", err.message);
        return res.redirect("/users/cart");
      }
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

exports.update = (req, res, next) => {
  let item = req.body;
  let id = req.params.id;
  model
    .findByIdAndUpdate(id, item, {
      useFindAndModify: false,
      runValidators: true,
    })
    .then((trade) => {
      if (trade) {
        res.redirect("/trades/" + id);
      } else {
        let err = new Error("Cannot find Outfit with id: " + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        err.status = 400;
        req.flash("error", err.message);
        return res.redirect("back");
      }
      next(err);
    });
};

exports.delete = (req, res, next) => {
  let id = req.params.id;
  model
    .findByIdAndDelete(id, { useFindAndModify: false })
    .then((trade) => {
      if (trade) {
        res.redirect("/trades");
      } else {
        let err = new Error("Cannot find Outfit with id: " + id);
        err.status = 404;
        req.flash("error", err.message);
        return res.redirect("/users/cart");
      }
    })
    .catch((err) => next(err));
};

exports.search = (req, res, next) => {
  let searchQuery = req.query.query;
  model
    .find()
    .then((items) => {
      const trades = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ("gender:" + item.gender.toLowerCase()).match(
            searchQuery.toLowerCase()
          ) ||
          ("size:" + item.size.toLowerCase()).match(
            searchQuery.toLowerCase()
          ) ||
          item.details.toLowerCase().includes(searchQuery.toLowerCase())
      );
      res.render("./trade/searchResults", { trades });
    })
    .catch((err) => next(err));
};

exports.watch = (req, res, next) => {
  let id = req.params.id;
  let userId = req.session.user;
  model
    .findByIdAndUpdate(
      id,
      { $addToSet: { watchHistory: userId } },
      { useFindAndModify: false, runValidators: true }
    )
    .then((trade) => {
      return res.redirect("/users/cart");
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

exports.unwatch = (req, res, next) => {
  let id = req.params.id;
  let userId = req.session.user;
  model
    .findByIdAndUpdate(
      id,
      { $pull: { watchHistory: userId } },
      { useFindAndModify: false, runValidators: true }
    )
    .then((trade) => {
      return res.redirect("/users/cart");
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAvailable = (req, res, next) => {
  let id = req.params.id;
  Promise.all([
    model.findById(id),
    model.find({ owner: req.session.user, status: "Available" }),
  ])
    .then((results) => {
      const [trade, tradeList] = results;
      if (trade) {
        res.render("./trade/trading", { id, tradeList });
      } else {
        let err = new Error("Invalid trade id");
        err.status = 400;
        req.flash("error", err.message);
        return res.redirect("back");
      }
    })
    .catch((err) => next(err));
};

exports.makeOffer = (req, res, next) => {
  let id = req.params.id;
  let tradeItem = req.body.tradeItem;
  model
    .findByIdAndUpdate(
      tradeItem,
      { $set: { status: "Offer Pending" } },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((trade) => {
      if (trade) {
      } else {
        console.log("update failed");
      }
    })
    .catch((err) => next(err));
  model
    .findByIdAndUpdate(
      id,
      {
        $set: {
          offerItem: tradeItem,
          offerItemOwner: req.session.user,
          status: "Offer Pending",
        },
      },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .catch((err) => next(err));
  return res.redirect("/users/cart");
};

exports.cancelOffer = (req, res, next) => {
  let tradeItem = req.params.tradeItemId;
  let itemId = req.params.itemId;

  model
    .findByIdAndUpdate(
      tradeItem,
      {
        $set: {
          offerItem: null,
          offerItemOwner: null,
          status: "Available",
        },
      },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .catch((err) => next(err));
  model
    .findByIdAndUpdate(
      itemId,
      { $set: { status: "Available", offerItem: null, offerItemOwner: null } },
      { useFindAndModify: false, runValidators: true }
    )
    .catch((err) => next(err));

  return res.redirect("/users/cart");
};

exports.manageOffer = (req, res, next) => {
  let id = req.params.id;
  model
    .findById(id)
    .populate("offerItem", "id title image")
    .then((trade) => {
      if (trade) {
        res.render("./trade/offer", { trade });
      }
    })
    .catch((err) => next(err));
};
exports.accept = (req, res, next) => {
  let itemId = req.params.itemId;
  let tradeItemId = req.params.tradeItemId;
  model
    .findByIdAndUpdate(itemId, { $set: { status: "Traded" } })
    .then((trade) => {
      if (trade) {
        itemId = trade.offerItem;
      }
    })
    .catch((err) => next(err));
  model
    .findByIdAndUpdate(tradeItemId, {
      $set: {
        status: "Traded",
        offerItem: itemId,
        offerItemOwner: req.session.user,
      },
    })
    .then((item) => {
      if (item) {
        return res.redirect("/users/cart");
      }
    })
    .catch((err) => next(err));
};
exports.addReview = async (req, res, next) => {
  let tradeId = req.params.id;
  const { review } = req.body;
  let user = req.session.user;
  try {
    const userInfo=await userModel.findById(user);
    let name=userInfo.firstName;
    // Find the outfit by tradeId
    const outfit = await model.findById(tradeId);
    if (!outfit) {
      return res.status(404).json({ error: "Outfit not found" });
    }
    // Create the review object
    const newReview = {
      user,
      name,
      review
    };
    outfit.reviews.push(newReview);
    model
      .findByIdAndUpdate(tradeId, { $set: { reviews: outfit.reviews } },{ useFindAndModify: false, runValidators: true })
      .then((trade) => {
        return res.redirect("/users/cart");
      })
      .catch((err) => next(err));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

