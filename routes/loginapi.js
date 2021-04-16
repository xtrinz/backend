require("dotenv").config();

const express = require("express");
const httpStatusCodes = require("../error/httpstatuscode");

// json web token for authentication

const {
  phoneEmailSyntaxVerification,
  isUserExist,
  verifyOtp,
  checkOtpVerifiedStatus,
  updatePasswordCredentials,
  sendOtp,
} = require("../middlewares/apimiddleware");
const { verifyLoginCredentials } = require("../database/login");
const validator = require("../validators/login");

const router = express.Router();

router.post("/", validator.verify_login, async (req, res, next) => {
  try {
    const { user, password } = req.body;
    const token = await verifyLoginCredentials(user, password);
    return res
      .status(httpStatusCodes.OK)
      .json({ message: "Success Fully Logged in", token });
  } catch (error) {
    next(error);
  }
});

// changes happened
// validate uid and send otp
router.post(
  "/forgotpassword",
  validator.validate_uid,
  sendOtp,
  (req, res, next) => {
    const { phonenumber, email } = req.body;
    if (phonenumber) {
      const lastDigitsPhoneNumber = String(phonenumber).slice(-4);
      return res.status(httpStatusCodes.OK).json({
        message:
          "An otp send to your phone number ending " + lastDigitsPhoneNumber,
        phonenumber,
      });
    } else {
      const lastDigitsEmail = String(email).slice(-15);
      return res.status(httpStatusCodes.OK).json({
        message: "An otp send to your email ending " + lastDigitsEmail,
        email,
      });
    }
  }
);

router.post("/verifyotp", validator.verify_otp, verifyOtp, (req, res, next) => {
  const { phonenumber, email } = req.body;
  if (phonenumber) {
    return res.json({ message: "Otp verified success fully", phonenumber });
  } else {
    return res.json({ message: "Otp verified success fully", email });
  }
});

router.post(
  "/updatepassword",
  validator.update_pass,
  checkOtpVerifiedStatus,
  updatePasswordCredentials,
  (req, res, next) => {
    const { phonenumber, email } = req.body;
    if (phonenumber) {
      return res.json({
        message: "Password updated success fully",
        phonenumber,
      });
    } else {
      return res.json({
        message: "Password updated success fully",
        email,
      });
    }
  }
);

module.exports = router;
