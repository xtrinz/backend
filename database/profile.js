const { ObjectId } = require("mongodb");
const { userCollection } = require("./connect");
const { Api403Error } = require("../error/errorclass/errorclass");
const { comparePassword, hashPassword, compareTwo } = require("../common/utils");

const dataForProfilePage = function (user) {
  const returnData = {
    firstname: user.firstname,
    lastname: user.lastname,
    phonenumber: user.phonenumber,
    email: user.email,
  };
  return returnData;
};

const updateUserDetails = async function (user, firstname, lastname) {
  const query = {
    _id: ObjectId(user._id),
  };
  const options = {
    $set: {
      firstname,
      lastname,
    },
  };
  await userCollection.updateOne(query, options);
};

const verifyUser = async function (user, phonenumber, email, password) {
  if (phonenumber) {
    if (!compareTwo(phonenumber, user.phonenumber)) {
      throw new Api403Error(
        "Forbidden",
        "Your username or password is incorrect"
      );
    }
  } else if (email) {
    if (!compareTwo(email, user.email)) {
      throw new Api403Error(
        "Forbidden",
        "Your username or password is incorrect"
      );
    }
  }
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Api403Error(
      "Forbidden",
      "Your username or password is incorrect"
    );
  }
  const query = {
    _id: ObjectId(user._id),
  };
  const options = {
    $set: {
      credentialchangepermission: true,
    },
  };
  await userCollection.updateOne(query, options);
  return isValid;
};

const updateUserPhoneEmail = async function (user, phonenumber, email) {
  const query = {
    _id: ObjectId(user._id),
  };
  let options;
  if (phonenumber) {
    options = {
      $set: {
        phonenumber,
      },
    };
  } else if (email) {
    options = {
      $set: {
        email,
      },
    };
  }
  await userCollection.updateOne(query, options);
};

const updateUserPassword = async function (user, oldpassword, newpassword) {
  const query = {
    _id: ObjectId(user._id),
  };
  const isValid = await comparePassword(oldpassword, user.password);
  if (!isValid) {
    throw new Api403Error("Forbidden", "Your password is incorrect");
  }
  const password = await hashPassword(newpassword, 12);
  const options = {
    $set: {
      password,
    },
  };
  await userCollection.updateOne(query, options);
};

module.exports = {
  dataForProfilePage,
  updateUserDetails,
  verifyUser,
  updateUserPassword,
  updateUserPhoneEmail,
};
