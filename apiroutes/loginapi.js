require("dotenv").config();

const express = require("express");

// json web token for authentication

const {
  phoneEmailSyntaxVerification,
  isUserExist,
  verifyOtp,
  checkOtpVerifiedStatus,
  updatePasswordCredentials,
  sendOtp,
} = require("../middlewares/apimiddleware");
const { verifyLoginCredentials } = require("../retrievedatafromdatabase/login");

const router = express.Router();

router.post(
  "/",
  phoneEmailSyntaxVerification,
  isUserExist,
  async (req, res, next) => {
    // uid will be either phone or email
    const { user, password } = req.body;
    console.log(user);
    const token = await verifyLoginCredentials(user, password);
    return res.json({ message: "Success Fully Login", token: token });
  }
);

// changes happened
// validate uid and send otp
router.post(
  "/forgotpassword",
  phoneEmailSyntaxVerification,
  isUserExist,
  sendOtp,
  (req, res, next) => {
    const { phonenumber } = req.body;
    return res.json({ message: "Success", phonenumber: phonenumber });
  }
);

router.post(
  "/verifyotp",
  phoneEmailSyntaxVerification,
  verifyOtp,
  (req, res, next) => {
    const { phonenumber } = req.body;
    return res.json({ message: "Success", phonenumber: phonenumber });
  }
);

router.post(
  "/updatepassword",
  phoneEmailSyntaxVerification,
  checkOtpVerifiedStatus,
  updatePasswordCredentials,
  (req, res, next) => {
    const { phonenumber } = req.body;
    return res.json({ message: "Success", phonenumber: phonenumber });
  }
);

module.exports = router;
