// environmental variables stored in .env file
require("dotenv").config()
// express instance
const express = require("express")
const {
  verifyAuthorizationToken,
  forbiddenApiCall,
} = require("./middlewares/apimiddleware")

// routes requering
const home = require("./routes/home")
const cart = require("./routes/cart")
const location_ = require("./routes/location")
const login = require("./routes/login")
const orderhistory = require("./routes/orderhistory")
const payment = require("./routes/payment")
const profile = require("./routes/profile")
const search = require("./routes/search")
const shopitem = require("./routes/shopitem")
const register = require("./routes/register")
const webhook = require("./routes/webhook")
const {
  logErrorMiddleware,
  returnError,
  handleUnCaughtException,
  handlePromiseRejection,
} = require("./error/errorhandlers")
const { gracefulShutdown } = require("./functions")

// creating application
const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/transaction/webhook")) {
        req.rawBody = buf.toString()
      }
    },
  })
)

// jwt token verification not required for login and register
app.use("/register", register)
app.use("/login", login)
app.use("/webhook", webhook)
// middleware for verifieying jwt token
app.use(verifyAuthorizationToken)

app.use("/", home)
app.use("/cart", cart)
app.use("/location", location_)
app.use("/orderhistory", orderhistory)
app.use("/payment", payment)
app.use("/profile", profile)
app.use("/search", search)
app.use("/shopitem", shopitem)
app.use(forbiddenApiCall)

// error handling
app.use(logErrorMiddleware)
app.use(returnError)

// This will prevent dirty exit on code-fault crashes:
process.on("uncaughtException", handleUnCaughtException)
process.on("unhandledRejection", handlePromiseRejection)
// This will handle process.exit():
process.on("exit", gracefulShutdown)
// This will handle kill commands, such as CTRL+C:
process.on("SIGINT", gracefulShutdown)
process.on("SIGTERM", gracefulShutdown)
process.on("SIGKILL", gracefulShutdown)

// listening on port 3001
app.listen(3001, () => {
  console.log("Server Running On Port 3001")
})
