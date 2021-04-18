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
  const tempshopinfoids = user.tempshopinfoids;
  let data = [];
  for (const tempshopinfoid of tempshopinfoids) {
    const query = {
      tempshopinfoid,
    };
    const tempshopinfo = await tempShopInfoCollection.findOne(query);
    const arrayData = {
      shopname: tempshopinfo.shopname,
      location: {
        addressline: tempshopinfo.location.addressline,
        feature: tempshopinfo.location.feature,
        landmark: tempshopinfo.location.landmark,
      },
      shoptype: tempshopinfo.shoptype,
      brandname: tempshopinfo.brandname,
      verificationstatus: tempshopinfo.verificationstatus,
    };
    data.push(arrayData);
  }
  return data;
};

module.exports = {
  createShop,
  verificationstatus,
};
