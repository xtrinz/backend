// environmental variables stored in .env file
require("dotenv").config();
// express instance
const express = require("express");
const {
  verifyAuthorizationToken,
  forbiddenApiCall,
} = require("./common/middleware");

// routes customer
const home = require("./routes/customer/home");
const cart = require("./routes/customer/cart");
const location = require("./routes/customer/location");
const login = require("./routes/customer/login");
const orderhistory = require("./routes/customer/orderhistory");
const payment = require("./routes/customer/payment");
const profile = require("./routes/customer/profile");
const search = require("./routes/customer/search");
const shopitem = require("./routes/customer/shopitem");
const register = require("./routes/customer/register");
// routes stripe payment gateway
const webhook = require("./routes/stripe/webhook");
// routes shop
const createshop = require("./routes/shop/createshop");
const crudshop = require("./routes/shop/crudshop");
const crudemployee = require("./routes/shop/crudemployee");
const shoporderhistory = require("./routes/shop/shoporderhistory");
const paymentstatement = require("./routes/shop/paymentstatement");

const {
  logErrorMiddleware,
  returnError,
  handleUnCaughtException,
  handlePromiseRejection,
} = require("./error/errorhandlers");
const { gracefulShutdown } = require("./common/utils");

// creating application
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

// jwt token verification not required for login and register
app.use("/register", register);
app.use("/login", login);
app.use("/webhook", webhook);
// middleware for verifieying jwt token
app.use(verifyAuthorizationToken);

app.use("/", home);
app.use("/cart", cart);
app.use("/location", location);
app.use("/orderhistory", orderhistory);
app.use("/payment", payment);
app.use("/profile", profile);
app.use("/search", search); // Todo : Incomplete. we need a proper algorithm (elastic search)
app.use("/shopitem", shopitem);

app.use("/sell", createshop);
app.use("/crudshop", crudshop);
app.use("/crudemployee", crudemployee);
app.use("/order", shoporderhistory);
app.use("/paymentstatement", paymentstatement);
app.use(forbiddenApiCall);

// error handling
app.use(logErrorMiddleware);
app.use(returnError);

// This will prevent dirty exit on code-fault crashes:
process.on("uncaughtException", handleUnCaughtException);
process.on("unhandledRejection", handlePromiseRejection);
// This will handle process.exit():
process.on("exit", gracefulShutdown);
// This will handle kill commands, such as CTRL+C:
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGKILL", gracefulShutdown);

// listening on port 3001
app.listen(3001, () => {
  console.log("Server Running On Port 3001");
});
