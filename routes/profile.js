const express = require("express");
const code = require("../error/code");
const {
  phoneEmailSyntaxVerification,
  sendOtp,
  verifyOtp,
  verifyCredentialChangePermmision,
} = require("../common/middleware");
const {
  dataForProfilePage,
  updateUserDetails,
  verifyUser,
  updateUserPhoneEmail,
  updateUserPassword,
} = require("../database/profile");
const { pe_pass } = require("../validators/profile");
const validator = require("../validators/profile");

const router = express.Router();

router.get("/", (req, res, next) => {
  try {
    const { user } = req.body;
    const data = dataForProfilePage(user);
    // send response
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", validator.edit_normal, async (req, res, next) => {
  try {
    const { user, firstname, lastname } = req.body;
    await updateUserDetails(user, firstname, lastname);
    return res.status(code.OK).json("Success fully updated");
  } catch (error) {
    next(error);
  }
});

/* 
change phone number or email
1. verify password
2. send otp
3. verify otp
pe : - phone email
*/

router.post(
  "/pe/verifyuser",
  validator.pe_pass,
  phoneEmailSyntaxVerification,
  async (req, res, next) => {
    try {
      const { user, phonenumber, email, password } = req.body;
      await verifyUser(user, phonenumber, email, password);
      return res.status(code.OK).json("Success");
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/pe/sendotp",
  validator.pe_send_otp,
  verifyCredentialChangePermmision,
  sendOtp,
  (req, res, next) => {
    const { phonenumber, email } = req.body;
    if (phonenumber) {
      const lastDigitsPhoneNumber = String(phonenumber).slice(-4);
      return res.status(code.OK).json({
        message:
          "An otp send to your phone number ending " + lastDigitsPhoneNumber,
        phonenumber,
      });
    } else {
      const lastDigitsEmail = String(email).slice(-15);
      return res.status(code.OK).json({
        message: "An otp send to your email ending " + lastDigitsEmail,
        email,
      });
    }
  }
);

router.post(
  "/pe/verifyotp",
  validator.pe_verify_otp,
  verifyCredentialChangePermmision,
  verifyOtp,
  async (req, res, next) => {
    try {
      const { user, phonenumber, email } = req.body;
      await updateUserPhoneEmail(user, phonenumber, email);
      if (phonenumber) {
        return res
          .status(code.OK)
          .json({ message: "Otp verified success fully", phonenumber });
      } else {
        return res
          .status(code.OK)
          .json({ message: "Otp verified success fully", email });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.post("/password", validator.update_pass, async (req, res, next) => {
  try {
    const { user, oldpassword, newpassword } = req.body;
    await updateUserPassword(user, oldpassword, newpassword);
    return res
      .status(code.OK)
      .json("Password updated success fully");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
