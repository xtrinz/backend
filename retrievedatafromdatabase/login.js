const jwt = require("jsonwebtoken");
const { Api401Error } = require("../error/errorclass/errorclass");
const { comparePassword } = require("../functions");
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

const verifyLoginCredentials = async function (user, password) {
  // then compare incoming password with one that stored in database
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Api401Error(
      "Unauthorized",
      "Your username or password is incorrect"
    );
  }
  const token = jwt.sign({ _id: user._id }, JWT_TOKEN_SECRET);
  return token;
};

module.exports = { verifyLoginCredentials };
