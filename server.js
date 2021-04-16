// environmental variables stored in .env file
require("dotenv").config();
// express instance
const express = require("express");
const {
  verifyAuthorizationToken,
  forbiddenApiCall,
} = require("./middlewares/apimiddleware");

// routes requering
const homeapi = require("./routes/homeapi");
const cartapi = require("./routes/cartapi");
const locationapi = require("./routes/locationapi");
const loginapi = require("./routes/loginapi");
const orderhistoryapi = require("./routes/orderhistoryapi");
const paymentapi = require("./routes/paymentapi");
const profileapi = require("./routes/profileapi");
const searchapi = require("./routes/searchapi");
const shopitemapi = require("./routes/shopitemapi");
const registerapi = require("./routes/registerapi");
const webhookapi = require("./routes/webhookapi");
const {
  logErrorMiddleware,
  returnError,
  handleUnCaughtException,
  handlePromiseRejection,
} = require("./error/errorhandlers");
const { gracefulShutdown } = require("./functions");

// creating application
const appApi = express();

appApi.use(express.urlencoded({ extended: true }));
appApi.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/transaction/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

// jwt token verification not required for login and register
appApi.use("/register", registerapi);
appApi.use("/login", loginapi);
appApi.use("/webhook", webhookapi);
// middleware for verifieying jwt token
appApi.use(verifyAuthorizationToken);

appApi.use("/", homeapi);
appApi.use("/cart", cartapi);
appApi.use("/location", locationapi);
appApi.use("/orderhistory", orderhistoryapi);
appApi.use("/payment", paymentapi);
appApi.use("/profile", profileapi);
appApi.use("/search", searchapi);
appApi.use("/shopitem", shopitemapi);
appApi.use(forbiddenApiCall);

// error handling
appApi.use(logErrorMiddleware);
appApi.use(returnError);

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
appApi.listen(3001, () => {
  console.log("Server Running On Port 3001");
});
