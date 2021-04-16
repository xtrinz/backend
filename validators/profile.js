const { body, oneOf } = require("express-validator");
const { validationError } = require("../error/errorhandlers");

const v1 = body("firstname", "400:Please provide a valid name")
  .isLength({ min: 3, max: 25 })
  .withMessage(
    "400:Name should have atleast 3 characters and atmost 25 characters"
  )
  .isString()
  .trim()
  .escape();
const v2 = body("lastname", "400:Please provide a valid name")
  .optional({ checkFalsy: true })
  .isString()
  .trim()
  .escape();
const { userCollection } = require("../database/connect");

const v3 = body("phonenumber", "401:Your username or password is incorrect")
  .custom(async (value, { req }) => {
    if (value && req.body.email) {
      return Promise.reject("401:Your username or password is incorrect");
    }
  })
  .isLength({ min: 13, max: 13 })
  .isString()
  .matches(/^\+91[0-9]{10}$/, "i")
  .trim()
  .escape();
const v4 = body("email", "401:Your username or password is incorrect")
  .custom(async (value, { req }) => {
    if (value && req.body.phonenumber) {
      return Promise.reject("401:Your username or password is incorrect");
    }
  })
  .isEmail()
  .isString()
  .trim();
const v5 = body("password", "401:Your username or password is incorrect")
  .isString()
  .isLength({ min: 6 })
  .trim()
  .escape(); // Todo : should add a regex
const v6 = body("phonenumber", "400:Invalid Phonenumber")
  .custom(async (value, { req }) => {
    if (value && req.body.email) {
      return Promise.reject("401:Invalid username");
    }
  })
  .isLength({ min: 13, max: 13 })
  .isString()
  .matches(/^\+91[0-9]{10}$/, "i")
  .custom(async phonenumber => {
    const query = {
      phonenumber,
    };
    const user = await userCollection.findOne(query);
    if (user) {
      return Promise.reject("409:Phone number already in use");
    }
  })
  .trim()
  .escape();
const v7 = body("email", "400:Invalid Email")
  .custom(async (value, { req }) => {
    if (value && req.body.phonenumber) {
      return Promise.reject("401:Invalid username");
    }
  })
  .isEmail()
  .isString()
  .trim()
  .custom(async email => {
    const query = {
      email,
    };
    const user = await userCollection.findOne(query);
    if (user) {
      return Promise.reject("409:Email address already in use");
    }
  });
const v8 = body("otp", "400:Invalid Otp")
  .isLength({ min: 6, max: 6 })
  .isString()
  .matches(/^([0-9]{6}$)/, "i")
  .trim()
  .escape();
const v9 = body(
  ["oldpassword", "newpassword"],
  "401:Please provide a strong password"
)
  .isString()
  .isLength({ min: 6 })
  .trim()
  .escape(); // Todo : should add a regex

const edit_normal = [v1, v2];
const pe_pass = oneOf([
  [v5, v3],
  [v5, v4],
]);
const pe_send_otp = oneOf([v6, v7]);
const pe_verify_otp = oneOf([
  [v8, v6],
  [v8, v7],
]);
const update_pass = [v9];

module.exports = {
  edit_normal: [edit_normal, validationError],
  pe_pass: [pe_pass, validationError],
  pe_send_otp: [pe_send_otp, validationError],
  pe_verify_otp: [pe_verify_otp, validationError],
  update_pass: [update_pass, validationError],
};
