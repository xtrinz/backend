const { users } = require("../connect");
const { ObjectID } = require("mongodb");

const getAllAddresses = function (user) {
  return user.address;
};
const getAddress = function (user, addressid) {
  for (const address of user.address) {
    if (address._id == addressid) {
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
  location,
  isdefault,
  isfavourite
) {
  // updating location info into database
  const addressId = new ObjectID();
  location = {
    _id: addressId,
    type: "Point",
    coordinates: [location.lng, location.lat],
    addressline: location.addressline,
    feature: location.feature, // floor no. or complex name
    landmark: location.landmark,
    isfavourite,
    isdefault,
  };
  const query = {
    _id: user._id,
  };
  const options = {
    $push: {
      address: location,
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

const editAddress = async function (user, addressid, location) {
  const query = {
    _id: user._id,
    address: { $elemMatch: { _id: addressid } },
  };
  const options = {
    $set: {
      "address.$.feature": location.feature,
      "address.$.landmark": location.landmark,
      "address.$.addressline": location.addressline,
      "address.$.coordinates": [location.lng, location.lat],
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
