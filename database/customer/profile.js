const { users } = require("../connect");
const { Api403Error } = require("../../error/errorclass/errorclass");
const {
  comparePassword,
  hashPassword,
  compareTwo,
} = require("../../common/utils");

const GetByID = async function(Id)
{
  console.log(`Get-user-by-id. Id: ${Id}`)
  const query = { _id: Id }
  let user = await users.find(query)
  if (!user)
  {
    console.log(`User-not-found. _id: ${Id}`)
    return
  }
  console.log(`User-found. user: ${user}`)
  return user
}

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
    _id: user._id,
  };
  const options = {
    $set: {
      firstname,
      lastname,
    },
  };
  await users.updateOne(query, options);
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
    _id: user._id,
  };
  const options = {
    $set: {
      credentialchangepermission: true,
    },
  };
  await users.updateOne(query, options);
  return isValid;
};

const updateUserPhoneEmail = async function (user, phonenumber, email) {
  const query = {
    _id: user._id,
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
  await users.updateOne(query, options);
};

const updateUserPassword = async function (user, oldpassword, newpassword) {
  const query = {
    _id: user._id,
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
  await users.updateOne(query, options);
};

module.exports = {
  dataForProfilePage,
  updateUserDetails,
  verifyUser,
  updateUserPassword,
  updateUserPhoneEmail,
  GetByID
};
