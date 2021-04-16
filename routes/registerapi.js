const express = require("express");
const httpStatusCodes = require("../error/httpstatuscode");
const {
  sendOtp,
  checkOtpVerifiedStatus,
  isUserNotExist,
  verifyOtp,
  phoneEmailSyntaxVerification,
} = require("../middlewares/apimiddleware");
const { registerUser } = require("../db/register");
const validator = require("../validators/register");

const router = express.Router();

// request for validating phone number

router.post("/", validator.validate_phonenumber, sendOtp, (req, res, next) => {
  const { phonenumber } = req.body;
  const lastDigitsPhoneNumber = String(phonenumber).slice(-4);
  return res.status(httpStatusCodes.OK).json({
    message: "An otp send to your phone number ending " + lastDigitsPhoneNumber,
    phonenumber,
  });
});

// verify phone number with otp
router.post(
  "/verifyphonenumber",
  validator.verify_otp,
  verifyOtp,
  (req, res, next) => {
    const { phonenumber } = req.body;
    return res.status(httpStatusCodes.OK).json({
      message: "Otp verified success fully",
      phonenumber,
    });
  }
);

// register user
router.post(
  "/user",
  validator.reg_user,
  checkOtpVerifiedStatus,
  async (req, res, next) => {
    try {
      let { firstname, lastname, password, phonenumber, email } = req.body;
      // hash password
      const token = await registerUser(
        firstname,
        lastname,
        password,
        phonenumber,
        email
      );
      return res
        .status(httpStatusCodes.OK)
        .json({ message: "Success Fully registered", token });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
