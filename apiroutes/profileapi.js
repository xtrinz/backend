const express = require("express");
const {
  phoneEmailSyntaxVerification,
  isUserNotExist,
  sendOtp,
  verifyOtp,
} = require("../middlewares/apimiddleware");
const {
  dataForProfilePage,
  updateUserDetails,
  verifyUser,
  updateUserPhoneEmail,
  updateUserPassword,
} = require("../retrievedatafromdatabase/profile");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { userid } = req.body;
  const data = await dataForProfilePage(userid);
  // send response
  return res.json(data);
});

router.post("/", async (req, res, next) => {
  const { userid, firstname, lastname } = req.body;
  await updateUserDetails(userid, firstname, lastname);
  return res.json("Success");
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
  phoneEmailSyntaxVerification,
  async (req, res, next) => {
    const { userid, phonenumber, email, password } = req.body;
    const isValid = await verifyUser(userid, phonenumber, email, password);
    if (!isValid) {
      // send error
    }
    return res.json("Success");
  }
);

router.post(
  "/pe/sendotp",
  phoneEmailSyntaxVerification,
  isUserNotExist,
  sendOtp,
  async (req, res, next) => {
    const { phonenumber } = req.body;
    return res.json({ message: "Success", phonenumber: phonenumber });
  }
);

router.post(
  "/pe/verifyotp",
  phoneEmailSyntaxVerification,
  verifyOtp,
  async (req, res, next) => {
    const { userid, phonenumber } = req.body;
    await updateUserPhoneEmail(userid, phonenumber);
    return res.json({ message: "Success", phonenumber: phonenumber });
  }
);

router.post("/password", async (req, res, next) => {
  const { userid, oldpassword, newpassword } = req.body;
  await updateUserPassword(userid, oldpassword, newpassword);
  return res.json("Success");
});

module.exports = router;
