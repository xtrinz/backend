const { isArrayEmpty } = require("../../common/utils");
const { tempShopInfoCollection, userCollection } = require("../connect");

const createShop = async function (
  user,
  shopname,
  shopimage,
  location,
  brandname,
  shoptype,
  certificates,
  contactdetails
) {
  location = {
    type: "Point",
    coordinates: [location.lng, location.lat],
    addressline: location.addressline,
    feature: location.feature, // floor no. or complex name
    landmark: location.landmark,
  };
  const insertOptions = {
    shopname,
    location,
    shopimage,
    brandname,
    shoptype,
    certificates,
    contactdetails,
    verificationstatus: "Not started",
  };
  const tempshopinfo = await tempShopInfoCollection.insertOne(insertOptions);
  const query = {
    _id: user._id,
  };
  const options = {
    $push: {
      tempshopinfoids: tempshopinfo.insertedId,
    },
  };
  await userCollection.updateOne(query, options);
};

const verificationstatus = async function (user) {
  if (isArrayEmpty(user.tempshopinfoids)) {
    return;
  }
  const query = {
    _id: {
      $in: user.tempshopinfoids,
    },
  };
  const tempshopinfo = await tempShopInfoCollection.find(query);
  let data = [];
  for await (const tempshop of tempshopinfo) {
    const arrayData = {
      shopname: tempshop.shopname,
      shopimage: tempshop.shopimage,
      location: {
        addressline: tempshop.location.addressline,
        feature: tempshop.location.feature,
        landmark: tempshop.location.landmark,
      },
      shoptype: tempshop.shoptype,
      brandname: tempshop.brandname,
      verificationstatus: tempshop.verificationstatus,
    };
    data.push(arrayData);
  }
  return data;
};

module.exports = {
  createShop,
  verificationstatus,
};
