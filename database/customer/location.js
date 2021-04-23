const { users } = require("../connect");
const { ObjectID } = require("mongodb");

const getAllAddresses = function (user) {
  return user.address;
};
const getAddress = function (user, addressid) {
  for (const address of user.address) {
    if (address._id == addressid) {
      // addressid coming from params are the type of objectid so no need to convert to string
      console.log("true");
      return address;
    }
  }
};

/**
 *
 * @param {id of the user} userid
 * @param {*latitude} lat
 * @param {*longitude} lng
 * add user location to database
 */
const addLocationToDatabase = async function (
  user,
  lat,
  lng,
  house,
  street,
  landmark,
  town,
  state,
  country,
  pincode,
  isdefault,
  isfavourite
) {
  // updating location info into database
  const addressId = new ObjectID();
  const query = {
    _id: user._id,
  };
  const options = {
    $push: {
      address: {
        _id: addressId,
        house,
        street,
        landmark,
        town,
        state,
        country,
        pincode,
        latlng: {
          lat,
          lng,
        },
        isfavourite,
        isdefault,
      },
    },
  };
  await users.updateOne(query, options);
  return addressId;
};

const makeAddressFavourite = async function (user, addressid, isfavourite) {
  const query = {
    _id: user._id,
    address: { $elemMatch: { _id: addressid } },
  };
  const options = {
    $set: {
      "address.$.isfavourite": isfavourite,
    },
  };
  await users.updateOne(query, options);
};

const removeAddress = async function (user, addressid) {
  const query = {
    _id: user._id,
  };
  const options = {
    $pull: {
      address: {
        _id: addressid,
      },
    },
  };
  await users.updateOne(query, options);
};

const editAddress = async function (
  user,
  addressid,
  lat,
  lng,
  house,
  street,
  landmark,
  town,
  state,
  country,
  pincode
) {
  const query = {
    _id: user._id,
    address: { $elemMatch: { _id: addressid } },
  };
  const options = {
    $set: {
      "address.$.house": house,
      "address.$.street": street,
      "address.$.landmark": landmark,
      "address.$.town": town,
      "address.$.state": state,
      "address.$.country": country,
      "address.$.pincode": pincode,
      "address.$.latlng": {
        lat,
        lng,
      },
    },
  };
  await users.updateOne(query, options);
};

module.exports = {
  getAllAddresses,
  getAddress,
  addLocationToDatabase,
  makeAddressFavourite,
  removeAddress,
  editAddress,
};
