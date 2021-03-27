require("dotenv").config();
const express = require("express");
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
    return res.json({ message: "Success", phonenumber: phonenumber });
  }
);

// verify phone number with otp
router.post(
  "/verifyphonenumber",
  phoneEmailSyntaxVerification,
  verifyOtp,
  (req, res, next) => {
    const { phonenumber } = req.body;
    return res.json({ message: "Success", phonenumber: phonenumber });
  }
);

// register user
router.post(
  "/user",
  phoneEmailSyntaxVerification,
  checkOtpVerifiedStatus,
  async (req, res, next) => {
    let { firstname, lastname, password, phonenumber, email } = req.body;
    // hash password
    const token = await registerUser(
      firstname,
      lastname,
      password,
      phonenumber,
      email
    );
    return res.json({ message: "Success Fully registered", token: token });
  }
);

module.exports = router;
