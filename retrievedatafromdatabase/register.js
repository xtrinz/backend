const { ObjectId } = require("mongodb");
const {
  cartCollection,
  userCollection,
  temporaryUserCollection,
} = require("../databaseconnections/mongoconnection");
// json web token for authentication
const jwt = require("jsonwebtoken");
const { hashPassword, isObjectEmpty } = require("../functions");
const { Api500Error } = require("../error/errorclass/errorclass");

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

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
  const cart = await cartCollection.insertOne(insertOptions1);
  // store data into user collection
  const insertOptions2 = {
    firstname,
    lastname,
    password,
    phonenumber,
    email,
    cartid: ObjectId(cart.insertedId),
    address: [],
    temporaryproducts: [],
    purchaseid: [],
  };
  const user = await userCollection.insertOne(insertOptions2);
  await temporaryUserCollection.deleteMany({ phonenumber });
  const token = jwt.sign({ _id: user.insertedId }, JWT_TOKEN_SECRET);
  return token;
};

module.exports = {
  registerUser,
};
