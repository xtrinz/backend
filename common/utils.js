require("dotenv").config();
const { client } = require("../database/connect")

const validatePhoneNumber = function (mobno)
{
  let pattern = new RegExp("^\\+91[0-9]{10}$") // mandatory +91
  if (!pattern.test(mobno)) { return "" }
  return mobno
}
const validateEmail = function (email)
{
  let pattern = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")
  if (!pattern.test(email)) { return "" }
  return email;
}

const isObjectEmpty = function (obj) {
  return typeof obj != "object" || Object.keys(obj).length === 0;
};

const isArrayEmpty = function (arr) {
  return !Array.isArray(arr) || arr.length == 0;
}

const gracefulShutdown = async function () {
  try {
    await client.close()
  } catch (error) {
    console.log(error)
  }
}

module.exports = 
{
  isObjectEmpty, // wide
  isArrayEmpty, // wide
  gracefulShutdown, // wide
}