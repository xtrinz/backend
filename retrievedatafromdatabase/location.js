const { userCollection } = require("../databaseconnections/mongoconnection");
const { ObjectId, ObjectID } = require("mongodb");

const getAllAddresses = async function (userid) {
  const query = {
    _id: ObjectId(userid),
  };
  const options = {
    projection: {
      address: 1,
      _id: 0,
    },
  };
  const user = await userCollection.findOne(query, options);
  return user.address;
};
const getAddress = async function (userid, addressid) {
  const query = {
    _id: ObjectId(userid),
  };
  const options = {
    projection: {
      address: { $elemMatch: { _id: ObjectId(addressid) } },
      _id: 0,
    },
  };
  const user = await userCollection.findOne(query, options);
  return user.address[0];
};

/**
 *
 * @param {id of the user} userid
 * @param {*latitude} lat
 * @param {*longitude} lng
 * add user location to database
 */
const addLocationToDatabase = async function (
  userid,
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
  // updating location info into database
  const query = {
    _id: ObjectId(userid),
  };
  const options = {
    $push: {
      address: {
        _id: new ObjectID(),
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
        isfavourite: false,
      },
    },
  };
  await userCollection.updateOne(query, options);
};

const makeAddressFavourite = async function (userid, addressid, isfavourite) {
  const query = {
    _id: ObjectId(userid),
    address: { $elemMatch: { _id: ObjectId(addressid) } },
  };
  const options = {
    $set: {
      "address.$.isfavourite": isfavourite,
    },
  };
  await userCollection.updateOne(query, options);
};

const removeAddress = async function (userid, addressid) {
  const query = {
    _id: ObjectId(userid),
  };
  const options = {
    $pull: {
      address: {
        _id: ObjectId(addressid),
      },
    },
  };
  await userCollection.updateOne(query, options);
};

const editAddress = async function (
  userid,
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
    _id: ObjectId(userid),
    address: { $elemMatch: { _id: ObjectId(addressid) } },
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
  await userCollection.updateOne(query, options);
};

module.exports.addLocationToDatabase = addLocationToDatabase;
module.exports.getAllAddresses = getAllAddresses;
module.exports.makeAddressFavourite = makeAddressFavourite;
module.exports.removeAddress = removeAddress;
module.exports.editAddress = editAddress;
module.exports.getAddress = getAddress;
