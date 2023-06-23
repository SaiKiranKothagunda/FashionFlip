// require modules
const express = require("express");
const morgan = require("morgan");
const tradeRoutes=require("./routes/tradeRoutes");
const mainRoutes=require("./routes/mainRoutes");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const userRoutes = require('./routes/userRoutes');

//create app
const app = express();

//configure app
let port = 3003;
let host = "localhost";
app.set("view engine", "ejs");

//mount middleware
app.use(
  session({
      secret: "ITIS5166NBAD",
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/NinerOutfitTrade'}),
      cookie: {maxAge: 60*60*1000}
      })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.user=req.session.user||null;
  res.locals.errorMessages = req.flash('error');
  res.locals.successMessages = req.flash('success');
  next();
});
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(methodOverride("_method"));

mongoose
  .connect('mongodb://localhost:27017/NinerOutfitTrade', {
    useNewUrlParser: true,
    useUnifiedTopology: true, useCreateIndex: true
  })
  .then(() => {
    //start server
    app.listen(port, host, () => {
      console.log("Server running in port", port);
    });
  })
  .catch((err) => console.log(err));


//set up routes
app.use("/",mainRoutes);

app.use("/trades", tradeRoutes);

app.use('/users', userRoutes);

app.use((req, res, next) => {
  let err = new Error("This Server cannot locate" + req.url);
  err.status = 404;
  next(err);
});
app.use((err, req, res, next) => {
  console.log(err.stack);
  if (!err.status) {
    err.status = 500;
    err.message = "Internal Server Error";
  }
  res.status(err.status);
  res.render("error", { error: err });
});

