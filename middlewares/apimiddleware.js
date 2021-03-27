require("dotenv").config();

// json web token for authentication
const jwt = require("jsonwebtoken");
const {
  userCollection,
  temporaryUserCollection,
} = require("../databaseconnections/mongoconnection");
const {
  comparePassword,
  validatePhoneNumber,
  sendOtpPhoneNumber,
  validateEmail,
  hashPassword,
} = require("../functions");

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

const verifyJwtToken = function (req, res, next) {
  const token = req.headers["x-access-token"];
  // verify jwt token
  jwt.verify(token, JWT_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      console.log(err);
      return res.json(err);
    } else {
      req.body.userid = decoded.id;
      next();
    }
  });
};

const phoneEmailSyntaxVerification = function (req, res, next) {
  let { uid } = req.body;
  const phonenumber = validatePhoneNumber(uid);
  if (phonenumber) {
    req.body.phonenumber = phonenumber;
  } else {
    const email = validateEmail(uid);
    if (!email) {
      // send error
    }
    req.body.email = email;
  }
  return next();
};

const isUserNotExist = async function (req, res, next) {
  const { phonenumber, email } = req.body;
  let query;
  if (phonenumber) {
    query = {
      phonenumber,
    };
  } else if (email) {
    query = {
      email,
    };
  }
  const user = await userCollection.findOne(query);
  if (user) {
    // send error
  }
  return next();
};

const isUserExist = async function (req, res, next) {
  const { phonenumber, email } = req.body;
  // if phone number then retrieve info regarding that phone number(user info)
  let query;
  if (phonenumber) {
    query = {
      phonenumber,
    };
  } else if (email) {
    query = {
      email,
    };
  }
  const options = {
    projection: {
      _id: 1,
      password: 1,
    },
  };
  req.body.user = await userCollection.findOne(query, options);
  return next();
};

const sendOtp = async function (req, res, next) {
  let { phonenumber } = req.body;
  await sendOtpPhoneNumber(phonenumber);
  // send success message
  next();
};

const verifyOtp = async function (req, res, next) {
  const { otp, phonenumber, email } = req.body;
  let query;
  if (phonenumber) {
    query = {
      phonenumber: phonenumber,
    };
  } else if (email) {
    query = {
      email: email,
    };
  }
  const options1 = {
    projection: {
      otp: 1,
      _id: 0,
    },
  };
  const temporaryuser = await temporaryUserCollection.findOne(query, options1);
  const isValid = await comparePassword(otp, temporaryuser.otp);
  if (!isValid) {
    // send error
  }
  const options2 = { $set: { isOtpVerified: true } };
  await temporaryUserCollection.updateOne(query, options2);
  next();
};

const checkOtpVerifiedStatus = async function (req, res, next) {
  const { phonenumber } = req.body;
  const query = {
    phonenumber: phonenumber,
  };
  const options = {
    projection: {
      isOtpVerified: 1,
      _id: 0,
    },
  };
  const data = await temporaryUserCollection.findOne(query, options);
  if (!data || (data && !data.isOtpVerified)) {
    // send error
  }
  return next();
};

const updatePasswordCredentials = async function (req, res, next) {
  let { phonenumber, email, password } = req.body;
  password = await hashPassword(password, 12);
  let query;
  if (phonenumber) {
    query = {
      phonenumber,
    };
  } else if (email) {
    query = {
      email,
    };
  }
  const options = {
    $set: {
      password,
    },
  };
  await userCollection.updateOne(query, options);
  await temporaryUserCollection.deleteMany(query);
  next();
};

module.exports.verifyJwtToken = verifyJwtToken;
module.exports.isUserExist = isUserExist;
module.exports.sendOtp = sendOtp;
module.exports.checkOtpVerifiedStatus = checkOtpVerifiedStatus;
module.exports.phoneEmailSyntaxVerification = phoneEmailSyntaxVerification;
module.exports.isUserNotExist = isUserNotExist;
module.exports.verifyOtp = verifyOtp;
module.exports.updatePasswordCredentials = updatePasswordCredentials;
