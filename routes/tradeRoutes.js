const express = require("express");
const controller = require("../controllers/tradeController");
const {
  isOwner,
  isNotOwner,
  vailidTrade,
  isLoggedIn,
  validateId,validateTrade,validateResult,canAccept
} = require("../middlewares/validator");

const router = express.Router();

router.get("/", controller.index);

router.get("/new", isLoggedIn, controller.new);

router.post("/", isLoggedIn, validateTrade,validateResult,controller.create);

router.get("/search",controller.search)

router.get("/:id", validateId, controller.show);

router.get("/:id/edit", validateId, isLoggedIn, isOwner, controller.edit);

router.put("/:id", validateId, isLoggedIn, isOwner,validateTrade,validateResult, controller.update);

router.delete("/:id", validateId, isLoggedIn, isOwner,validateResult, controller.delete);

router.put("/watch/:id",validateId,isLoggedIn,isNotOwner,validateResult,controller.watch);

router.put("/unwatch/:id",validateId,isLoggedIn,isNotOwner,validateResult,controller.unwatch);

router.get("/offer/:id",validateId,isLoggedIn,isNotOwner,validateResult,controller.getAvailable);

router.post("/offer/:id",validateId,isLoggedIn,isNotOwner,vailidTrade,validateResult,controller.makeOffer);

router.post("/offer/:tradeItemId/:itemId/accept",isLoggedIn,canAccept,validateResult,controller.accept);

router.put("/offer/cancel/:tradeItemId/:itemId",isLoggedIn,controller.cancelOffer);

router.get("/offer/manage/:id",validateId,isOwner,controller.manageOffer);

router.post("/:id/reviews",isLoggedIn,validateId,isNotOwner,controller.addReview);
module.exports = router;
