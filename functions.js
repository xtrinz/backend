/**
 * require environmental file
 * account sid and auth toke are for twilio - twilio library is used for sending messages
 * clientTwilio modele for creating connection
 * nodemailer is used to send mail
 * bcrypt is used to encrypt passwords and otp
 */
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const clientTwilio = require("twilio")(accountSid, authToken);
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const {
  userCollection,
  temporaryUserCollection,
} = require("./databaseconnections/mongoconnection");

// to generate 6 digit otp
function generateOTP() {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  console.log(OTP);
  return OTP;
}
// encrypt password
// brypt module is used
async function hashPassword(pass, saltNum) {
  const hashedPass = await bcrypt.hash(pass, saltNum);
  return hashedPass;
}
// compare password
async function comparePassword(pass, hash) {
  return await bcrypt.compare(pass, hash);
}
// sendsms via twilio library
async function sendSms(smsContent) {
  try {
    await clientTwilio.messages.create({
      body: smsContent.body,
      from: "+12566084484",
      to: smsContent.to,
    });
  } catch (error) {}
}
// send email via node mailer
function sendMail(emailContent) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ubaidrahmantsy231@gmail.com", // less secure of gmail enabled . catche access enabled
      pass: "123@nitc.com",
    },
  });
  var mailOptions = {
    from: "ubaidrahmantsy231@gmail.com",
    to: emailContent.to,
    subject: emailContent.subject,
    html: emailContent.html,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

// also checking incoming phone number is a valid one . if not send a null('')

const validatePhoneNumber = function (phonenumber) {
  let pattern = new RegExp("^([0-9]{10}$)");
  if (pattern.test(phonenumber)) {
    phonenumber = "+91" + phonenumber;
  } else {
    pattern = new RegExp("^91[0-9]{10}$");
    if (pattern.test(phonenumber)) {
      phonenumber = "+" + phonenumber;
    } else {
      pattern = new RegExp("^\\+91[0-9]{10}$"); // mandatory +91
      if (!pattern.test(phonenumber)) {
        return "";
      }
    }
  }
  return phonenumber;
};
const validateEmail = function (email) {
  let pattern = new RegExp(
    "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
  );
  if (pattern.test(email)) {
    return email;
  }
  return "";
};
/**
 * check wheather user with this credentials already exist or not
 */

const sendOtpPhoneNumber = async function (phonenumber) {
  const generatedOtp = generateOTP();
  const hashedOtp = await hashPassword(generatedOtp, 5);
  // send otp via sms
  const smsContent = {
    to: `${phonenumber}`,
    body: `This is your Otp for verification - ${generatedOtp}`,
  };
  await sendSms(smsContent);
  // delete otp if already there
  const query = {
    phonenumber: phonenumber,
  };
  await temporaryUserCollection.deleteMany(query);
  const data = {
    phonenumber: phonenumber,
    otp: hashedOtp,
    isOtpVerified: false,
    createdAt: new Date(),
  };
  await temporaryUserCollection.insertOne(data);
};

// exporting all the functions
module.exports.generateOTP = generateOTP;
module.exports.hashPassword = hashPassword;
module.exports.comparePassword = comparePassword;
module.exports.sendSms = sendSms;
module.exports.sendMail = sendMail;
module.exports.validatePhoneNumber = validatePhoneNumber;
module.exports.validateEmail = validateEmail;
module.exports.sendOtpPhoneNumber = sendOtpPhoneNumber;
