const { body, oneOf } = require("express-validator");
const { users } = require("../../../database/connect");
const { validationError } = require("./errorhandlers");

const v1 = body("phonenumber", "401:Your username or password is incorrect")
  .custom(async (value, { req }) => {
    if (value && req.body.email) {
      return Promise.reject("401:Your username or password is incorrect");
    }
  })
  .isLength({ min: 13, max: 13 })
  .isString()
  .matches(/^\+91[0-9]{10}$/, "i")
  .custom(async (phonenumber, { req }) => {
    const query = {
      phonenumber,
    };
    const options = {
      projection: {
        _id: 1,
        password: 1,
      },
    };
    const user = await users.findOne(query, options);
    if (!user) {
      return Promise.reject("401:Your username or password is incorrect");
    }
    req.body.user = user;
  })
  .trim()
  .escape();
const v2 = body("email", "401:Your username or password is incorrect")
  .custom(async (value, { req }) => {
    if (value && req.body.phonenumber) {
      return Promise.reject("401:Your username or password is incorrect");
    }
  })
  .isEmail()
  .isString()
  .custom(async (email, { req }) => {
    const query = {
      email,
    };
    const options = {
      projection: {
        _id: 1,
        password: 1,
      },
    };
    const user = await users.findOne(query, options);
    if (!user) {
      return Promise.reject("401:Your username or password is incorrect");
    }
    req.body.user = user;
  })
  .trim();
const v3 = body("password", "401:Your username or password is incorrect")
  .isString()
  .isLength({ min: 6 })
  .trim()
  .escape(); // Todo : should add a regex
const v4 = body("otp", "400:Invalid Otp")
  .isLength({ min: 6, max: 6 })
  .isString()
  .matches(/^([0-9]{6}$)/, "i")
  .trim()
  .escape();
const v5 = body("password", "400:Please provide a strong password")
  .isString()
  .isLength({ min: 6 })
  .withMessage("400:Password should contain minimum 6 characters")
  .trim()
  .escape(); // Todo : should add a regex
const v6 = body(
  "confirmPassword",
  "400:Password confirmation does not match password"
).custom((value, { req }) => {
  if (value !== req.body.password) {
    throw new Error("400:Password confirmation does not match password");
  }
  // Indicates the success of this synchronous custom validator
  return true;
});
// caution : order of v's in array is important so that error in nestedErrors will be come in that order
const verify_login = oneOf([
  [v3, v1],
  [v3, v2],
]);
const validate_uid = oneOf([v1, v2]);
const verify_otp = oneOf([
  [v4, v1],
  [v4, v2],
]);
const update_pass = oneOf([
  [v6, v5, v1],
  [v6, v5, v2],
]);

module.exports = {
  verify_login: [verify_login, validationError],
  validate_uid: [validate_uid, validationError],
  verify_otp: [verify_otp, validationError],
  update_pass: [update_pass, validationError],
};
