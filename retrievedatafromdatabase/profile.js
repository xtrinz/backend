const { ObjectId } = require("mongodb");
const { userCollection } = require("../databaseconnections/mongoconnection");
const { comparePassword, hashPassword } = require("../functions");

const dataForProfilePage = async function (userid) {
  const query = {
    _id: ObjectId(userid),
  };
  const options = {
    projection: {
      firstname: 1,
      lastname: 1,
      phonenumber: 1,
      email: 1,
      _id: 0,
    },
  };
  const user = await userCollection.findOne(query, options);
  return user;
};

const updateUserDetails = async function (userid, firstname, lastname) {
  const query = {
    _id: ObjectId(userid),
  };
  const options = {
    $set: {
      firstname,
      lastname,
    },
  };
  await userCollection.updateOne(query, options);
};

const verifyUser = async function (userid, phonenumber, email, password) {
  let query;
  if (phonenumber) {
    query = {
      _id: ObjectId(userid),
      phonenumber,
    };
  } else if (email) {
    query = {
      _id: ObjectId(userid),
      email,
    };
  }
  const options = {
    projection: {
      password: 1,
      _id: 0,
    },
  };
  const user = await userCollection.findOne(query, options);
  const isValid = await comparePassword(password, user.password);
  return isValid;
};

const updateUserPhoneEmail = async function (userid, phonenumber) {
  const query = {
    _id: ObjectId(userid),
  };
  const options = {
    $set: {
      phonenumber,
    },
  };
  await userCollection.updateOne(query, options);
};

const updateUserPassword = async function (userid, oldpassword, newpassword) {
  const query = {
    _id: ObjectId(userid),
  };
  const options1 = {
    projection: {
      password: 1,
      _id: 0,
    },
  };
  const user = await userCollection.findOne(query, options1);
  const isValid = await comparePassword(oldpassword, user.password);
  if (!isValid) {
    // send error
  }
  const password = await hashPassword(newpassword, 12);
  const options2 = {
    $set: {
      password,
    },
  };
  await userCollection.updateOne(query, options2);
};

module.exports.dataForProfilePage = dataForProfilePage;
module.exports.updateUserDetails = updateUserDetails;
module.exports.verifyUser = verifyUser;
module.exports.updateUserPassword = updateUserPassword;
module.exports.updateUserPhoneEmail = updateUserPhoneEmail;
