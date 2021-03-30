require("dotenv").config();
const express = require("express");
const httpStatusCodes = require("../error/httpstatuscode");
const {
  sendOtp,
  checkOtpVerifiedStatus,
  isUserNotExist,
  verifyOtp,
  phoneEmailSyntaxVerification,
} = require("../middlewares/apimiddleware");
const { registerUser } = require("../retrievedatafromdatabase/register");

const router = express.Router();

// request for validating phone number

router.post(
  "/",
  phoneEmailSyntaxVerification,
  isUserNotExist,
  sendOtp,
  (req, res, next) => {
    const { phonenumber } = req.body;
    const lastDigitsPhoneNumber = String(phonenumber).slice(-4);
    return res.status(httpStatusCodes.OK).json({
      message:
        "An otp send to your phone number ending " + lastDigitsPhoneNumber,
      phonenumber,
    });
  }
);

// verify phone number with otp
router.post(
  "/verifyphonenumber",
  phoneEmailSyntaxVerification,
  isUserNotExist,
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
  phoneEmailSyntaxVerification,
  isUserNotExist,
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
