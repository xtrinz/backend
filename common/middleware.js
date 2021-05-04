require("dotenv").config();
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const {
  users,
  sessions,
} = require("../database/connect");
const {
  Api401Error,
  Api403Error,
  Api404Error,
} = require("../error/errorclass/errorclass")

const JWT_AUTHORIZATION_TOKEN_SECRET =
  process.env.JWT_AUTHORIZATION_TOKEN_SECRET;
const JWT_SESSION_TOKEN_SECRET = process.env.JWT_SESSION_TOKEN_SECRET;

const verifyAuthorizationToken = async function (req, res, next) {
  try {
    let token = req.headers["authorization"]; // should change from x-access-token to authorization in client side
    if (!token) {
      throw new Api401Error("Unauthorized", "Please login to your accound");
    }
    // should add Bearer in header in client side
    if (token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    // verify jwt token
    const decoded = jwt.verify(token, JWT_AUTHORIZATION_TOKEN_SECRET);
    const query = {
      _id: ObjectId(decoded._id),
    };
    const user = await users.findOne(query);
    if (!user) {
      throw new Api401Error("Unauthorized", "Please login to your accound"); // Todo: we should revoke token
    }
    req.body.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const verifySessionToken = async function (req, res, next) {
  try {
    let token = req.headers["x-access-token"];
    if (!token) {
      throw new Api403Error("Forbidden", "Something went wrong");
    }
    // verify jwt token
    const decoded = jwt.verify(token, JWT_SESSION_TOKEN_SECRET);
    const query = {
      _id: ObjectId(decoded._id),
      userid: ObjectId(req.body.user._id),
    };
    const session = await sessions.findOne(query);
    if (!session) {
      throw new Api403Error("Forbidden", "Something went wrong");
    }
    req.body.session = session;
    next();
  } catch (error) {
    next(error);
  }
};

const forbiddenApiCall = (req, res, next) => {
  try {
    throw new Api404Error("Not found", "Page not found");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyAuthorizationToken,
  forbiddenApiCall, // in server.js
  verifySessionToken, // rout/payment.js
};
