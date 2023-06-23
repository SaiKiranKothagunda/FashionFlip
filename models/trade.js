const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const outfitSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required"] },
    category: { type: String, required: [true, "Category is required"] },
    details: {
      type: String,
      required: [true, "Deatils is required"],
      minLength: [10, "The Details should be greater than 10 characters"],
    },
    image: {
      type: String,
      required: [true, "Invalid URL"],
      default: "https://iili.io/paBLIn.png",
    },
    gender: {
      type: String,
      enum: ["Men", "Women"],
      required: [true, "Gender has to be mentioned"],
    },
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL"],
      required: [true, "Size has to be mentioned"],
    },
    contents: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Available", "Traded", "Offer Pending"],
      required: [true, "Status has to be mentioned"],
    },
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "User" }],
    offerItem: { type: Schema.Types.ObjectId, ref: "Trade" },
    offerItemOwner: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);
//collection name is trades in database
module.exports = mongoose.model("Trade", outfitSchema);
