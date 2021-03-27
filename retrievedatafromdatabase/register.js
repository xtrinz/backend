const { ObjectId } = require("mongodb");
const {
  cartCollection,
  userCollection,
  temporaryUserCollection,
} = require("../databaseconnections/mongoconnection");
// json web token for authentication
const jwt = require("jsonwebtoken");
const { hashPassword } = require("../functions");

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

const registerUser = async function (
  firstname,
  lastname,
  password,
  phonenumber,
  email
) {
  password = await hashPassword(password, 12);
  const cart = await cartCollection.insertOne({});
  const cartid = ObjectId(cart.insertedId);
  // store data into user collection
  const insertData = {
    firstname,
    lastname,
    password,
    phonenumber,
    email,
    cartid,
  };
  const user = await userCollection.insertOne(insertData);
  await temporaryUserCollection.deleteMany({ phonenumber });
  const token = jwt.sign({ id: user._id }, JWT_TOKEN_SECRET);
  return token;
};

module.exports.registerUser = registerUser;
