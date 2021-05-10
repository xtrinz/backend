const { body } = require("express-validator");
const { users } = require("../../../common/connect");
const { validationError } = require("./errorhandlers");

const v1 = body("phonenumber", "400:Invalid Phonenumber")
  .isLength({ min: 13, max: 13 })
  .isString()
  .matches(/^\+91[0-9]{10}$/, "i")
  .custom(async phonenumber => {
    const query = {
      phonenumber,
    };
    const user = await users.findOne(query);
    if (user) {
      return Promise.reject("409:Phone number already in use");
    }
  })
  .trim()
  .escape();
const v2 = body("otp", "400:Invalid Otp")
  .isLength({ min: 6, max: 6 })
  .isString()
  .matches(/^([0-9]{6}$)/, "i")
  .trim()
  .escape();
const v3 = body("firstname", "400:Please provide a valid name")
  .isLength({ min: 3, max: 25 })
  .withMessage(
    "400:Name should have atleast 3 characters and atmost 25 characters"
  )
  .isString()
  .trim()
  .escape();
const v4 = body("lastname", "400:Please provide a valid name")
  .optional({ checkFalsy: true })
  .isString()
  .trim()
  .escape();
const v5 = body("email", "400:Invalid Email")
  .isEmail()
  .isString()
  .optional({ checkFalsy: true })
  .trim()
  .custom(async email => {
    const query = {
      email,
    };
    const user = await users.findOne(query);
    if (user) {
      return Promise.reject("409:Email address already in use");
    }
  });
const v6 = body("password", "400:Please provide a strong password")
  .isString()
  .isLength({ min: 6 })
  .withMessage("400:Password should contain minimum 6 characters")
  .trim()
  .escape(); // Todo : should add a regex

const validate_phonenumber = [v1];
const verify_otp = [v1, v2];
const reg_user = [v1, v3, v4, v5, v6];

module.exports = {
  validate_phonenumber: [validate_phonenumber, validationError],
  verify_otp: [verify_otp, validationError],
  reg_user: [reg_user, validationError],
};
