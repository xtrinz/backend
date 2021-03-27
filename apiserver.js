// environmental variables stored in .env file
require("dotenv").config();
// express instance
const express = require("express");
const { verifyJwtToken } = require("./middlewares/apimiddleware");
const { client } = require("./databaseconnections/mongoconnection");

// routes requering
const homeapi = require("./apiroutes/homeapi");
const cartapi = require("./apiroutes/cartapi");
const locationapi = require("./apiroutes/locationapi");
const loginapi = require("./apiroutes/loginapi");
const orderhistoryapi = require("./apiroutes/orderhistoryapi");
const paymentapi = require("./apiroutes/paymentapi");
const profileapi = require("./apiroutes/profileapi");
const searchapi = require("./apiroutes/searchapi");
const shopitemapi = require("./apiroutes/shopitemapi");
const registerapi = require("./apiroutes/registerapi");

// creating application
const appApi = express();

appApi.use(express.urlencoded({ extended: true }));
appApi.use(express.json());

// jwt token verification not required for login and register
appApi.use("/login", loginapi);
appApi.use("/register", registerapi);
// middleware for verifieying jwt token
appApi.use(verifyJwtToken);

appApi.use("/", homeapi);
appApi.use("/cart", cartapi);
appApi.use("/location", locationapi);
appApi.use("/orderhistory", orderhistoryapi);
appApi.use("/payment", paymentapi);
appApi.use("/profile", profileapi);
appApi.use("/searchresult", searchapi);
appApi.use("/shopitem", shopitemapi);

// listening on port 3001
appApi.listen(3001, () => {
  console.log("Server Running On Port 3001");
});

async function gracefulShutdown() {
  try {
    await client.close();
  } catch (error) {
    console.log(error);
  }
}

// Ask node to run your function before exit:

// This will handle process.exit():
process.on("exit", gracefulShutdown);

// This will handle kill commands, such as CTRL+C:
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGKILL", gracefulShutdown);

// This will prevent dirty exit on code-fault crashes:
process.on("uncaughtException", gracefulShutdown);
