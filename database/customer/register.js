require("dotenv").config();
const { carts, users, tempUsers } = require("../connect");
// json web token for authentication
const jwt = require("jsonwebtoken");
const { hashPassword } = require("../../common/utils");

const JWT_AUTHORIZATION_TOKEN_SECRET =
  process.env.JWT_AUTHORIZATION_TOKEN_SECRET;

const registerUser = async function (
  firstname,
  lastname,
  password,
  phonenumber,
  email
) {
  password = await hashPassword(password, 12);
  const insertOptions1 = {
    products: [],
  };
  const cart = await carts.insertOne(insertOptions1);
  // store data into user collection
  const insertOptions2 = {
    firstname,
    lastname,
    password,
    phonenumber,
    email,
    cartid: cart.insertedId,
    address: [],
    purchaseid: [],
  };
  const user = await users.insertOne(insertOptions2);
  await tempUsers.deleteMany({ phonenumber });
  const token = jwt.sign(
    { _id: user.insertedId },
    JWT_AUTHORIZATION_TOKEN_SECRET
  );
  return token;
};

module.exports = {
  registerUser,
};
