require("dotenv").config();

const { ObjectId } = require("mongodb");
// json web token for authentication
const jwt = require("jsonwebtoken");
const {
  users,
  tempUsers,
  sessions,
} = require("../database/connect");
const {
  Api400Error,
  Api401Error,
  Api403Error,
  Api409Error,
  Api404Error,
} = require("../error/errorclass/errorclass");
const {
  comparePassword,
  validatePhoneNumber,
  sendOtpPhoneNumber,
  sendOtpEmail,
  validateEmail,
  hashPassword,
} = require("../common/utils");

const JWT_AUTHORIZATION_TOKEN_SECRET =
  process.env.JWT_AUTHORIZATION_TOKEN_SECRET;
const JWT_SESSION_TOKEN_SECRET = process.env.JWT_SESSION_TOKEN_SECRET;

const verifyAuthorizationToken = async function (req, res, next) {
  try {
    let token = req.headers["authorization"]; // should change from x-access-token to authorization in client side
    if (!token) {
      throw new Api401Error("Unauthorized", "Please login to your accound");
    }
    // should add Bearer in header in client side
    if (token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    // verify jwt token
    const decoded = jwt.verify(token, JWT_AUTHORIZATION_TOKEN_SECRET);
    const query = {
      _id: ObjectId(decoded._id),
    };
    const user = await users.findOne(query);
    if (!user) {
      throw new Api401Error("Unauthorized", "Please login to your accound"); // Todo: we should revoke token
    }
    req.body.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const verifySessionToken = async function (req, res, next) {
  try {
    let token = req.headers["x-access-token"];
    if (!token) {
      throw new Api403Error("Forbidden", "Something went wrong");
    }
    // verify jwt token
    const decoded = jwt.verify(token, JWT_SESSION_TOKEN_SECRET);
    const query = {
      _id: ObjectId(decoded._id),
      userid: ObjectId(req.body.user._id),
    };
    const session = await sessions.findOne(query);
    if (!session) {
      throw new Api403Error("Forbidden", "Something went wrong");
    }
    req.body.session = session;
    next();
  } catch (error) {
    next(error);
  }
};

const phoneEmailSyntaxVerification = function (req, res, next) {
  try {
    let { uid } = req.body;
    const phonenumber = validatePhoneNumber(uid);
    if (phonenumber) {
      req.body.phonenumber = phonenumber;
    } else {
      const email = validateEmail(uid);
      if (!email) {
        throw new Api400Error("Bad Request", "Invalid input");
      }
      req.body.email = email;
    }
    return next();
  } catch (error) {
    next(error);
  }
};

const isUserNotExist = async function (req, res, next) {
  try {
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
    const user = await users.findOne(query); // it return object or null
    if (user) {
      throw new Api409Error("Conflict", "User already exist");
    }
    return next();
  } catch (error) {
    next(error);
  }
};

const isUserExist = async function (req, res, next) {
  try {
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
    const user = await users.findOne(query, options);
    if (!user) {
      throw new Api401Error(
        "Unauthorized",
        "Your username or password is incorrect"
      );
    }
    req.body.user = user;
    return next();
  } catch (error) {
    next(error);
  }
};

const sendOtp = async function (req, res, next) {
  try {
    let { phonenumber, email } = req.body;
    if (phonenumber) {
      await sendOtpPhoneNumber(phonenumber);
    } else if (email) {
      await sendOtpEmail(email);
    }
    next();
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async function (req, res, next) {
  try {
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
    const temporaryuser = await tempUsers.findOne(
      query,
      options1
    );
    if (!temporaryuser) {
      throw new Api401Error("Unauthorized", "Phone number not verified");
    }
    const isValid = await comparePassword(otp, temporaryuser.otp);
    if (!isValid) {
      throw new Api401Error("Unauthorized", "Enter valid otp");
    }
    const options2 = { $set: { isOtpVerified: true } };
    await tempUsers.updateOne(query, options2);
    next();
  } catch (error) {
    next(error);
  }
};

const checkOtpVerifiedStatus = async function (req, res, next) {
  try {
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
    const options = {
      projection: {
        isOtpVerified: 1,
        _id: 0,
      },
    };
    const data = await tempUsers.findOne(query, options);
    if (!data || !data.isOtpVerified) {
      throw new Api401Error("Unauthorized", "Something went wrong");
    }
    return next();
  } catch (error) {
    next(error);
  }
};

const updatePasswordCredentials = async function (req, res, next) {
  try {
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
    await users.updateOne(query, options);
    await tempUsers.deleteMany(query);
    next();
  } catch (error) {
    next(error);
  }
};

const verifyCredentialChangePermmision = async function (req, res, next) {
  const { user } = req.body;
  if (!user.credentialchangepermission) {
    throw new Api403Error("Forbidden", "Please verify your account");
  }
  next();
};

const forbiddenApiCall = (req, res, next) => {
  try {
    throw new Api404Error("Not found", "Page not found");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyAuthorizationToken,
  isUserExist,
  isUserNotExist,
  sendOtp,
  verifyOtp,
  checkOtpVerifiedStatus,
  phoneEmailSyntaxVerification,
  updatePasswordCredentials,
  verifyCredentialChangePermmision,
  forbiddenApiCall,
  verifySessionToken,
};
