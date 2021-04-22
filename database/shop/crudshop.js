const {
  products,
  shops,
  users,
} = require("../connect");
const {
  Api409Error,
  Api404Error,
} = require("../../error/errorclass/errorclass");
const { isArrayEmpty, isObjectEmpty } = require("../../common/utils");

const getShops = async function (user) {
  if (isArrayEmpty(user.shopinfoids)) {
    return;
  }
  const query = {
    _id: {
      $in: user.shopinfoids,
    },
  };
  const shopinfo = await shops.find(query);
  let data = [];
  for await (const shop of shopinfo) {
    const arrayData = {
      shopname: shop.shopname,
      location: {
        addressline: shop.location.addressline,
        feature: shop.location.feature,
        landmark: shop.location.landmark,
      },
      shopimage: shop.shopimage,
      brandname: shop.brandname,
      shopinfoid: shop._id,
    };
    data.push(arrayData);
  }
  return data;
};

const getProductInfoFromUniqueid = async function (shopinfoid, uniqueid) {
  const query1 = {
    _id: shopinfoid,
  };
  const options1 = {
    $projection: {
      productids: 1,
    },
  };
  const shopinfo = await shops.findOne(query1, options1);
  if (isObjectEmpty(shopinfo)) {
    throw Api404Error("Not found", "Not Found");
  }
  const query2 = {
    _id: {
      $in: shopinfo.productids,
    },
    "productvariations.uniqueid": uniqueid,
  };
  const products = await products.findOne(query2);
  return products;
};

const getAllProductInShop = async function (shopinfoid) {
  const query1 = {
    _id: shopinfoid,
  };
  const options1 = {
    $projection: {
      productids: 1,
      shopname: 1,
    },
  };
  const shopinfo = await shops.findOne(query1, options1);
  if (isObjectEmpty(shopinfo)) {
    throw Api404Error("Not found", "Not Found");
  }
  if (isArrayEmpty(shopinfo.productids)) {
    return;
  }
  const query2 = {
    _id: {
      $in: shopinfo.productids,
    },
  };
  const products = await products.find(query2);
  let data = [];
  for await (const product of products) {
    const arrayData = {
      shopname: shopinfo.shopname,
      productname: product.productname,
      productvariations: product.productvariations, // we need a default setup. which variation should show by default
    };
    data.push(arrayData);
  }
  return data;
};

const getSingleProductFromShop = async function (shopinfoid, productid) {
  const query1 = {
    _id: shopinfoid,
  };
  const options1 = {
    $projection: {
      shopname: 1,
    },
  };
  const shopinfo = await shops.findOne(query1, options1);
  if (isObjectEmpty(shopinfo)) {
    throw Api404Error("Not found", "Not Found");
  }
  const query2 = {
    _id: productid,
    shopinfoid: shopinfoid,
  };
  const products = await products.findOne(query2);
  if (isObjectEmpty(products)) {
    throw Api404Error("Not found", "Not Found");
  }
  const returnData = {
    shopname: shopinfo.shopname,
    productname: products.productname,
    productvariations: products.productvariations,
    producttype: products.producttype,
    gstcategory: products.gstcategory,
    warrentycard: products.warrentycard,
    extradiscount: products.extradiscount,
    keywords: products.keywords,
    productdescription: products.productdescription,
    productdetails: products.productdetails,
  };
  return returnData;
};

const getSingleProductByUniqueId = async function (shopinfoid, uniqueid) {
  const products = await getProductInfoFromUniqueid(shopinfoid, uniqueid);
  if (isObjectEmpty(products)) {
    throw new Api404Error("Not found", "Not found");
  }
  let quantity, productcolor, productimage, variationtype, productprice;
  const variation = products.productvariations;
  for (const varient of variation) {
    if (varient.uniqueid == uniqueid) {
      quantity = varient.quantity;
      productprice = varient.productprice;
      productimage = varient.productimage;
      variationtype = varient.type;
      if (isArrayEmpty(variationtype)) {
        break;
      }
      if (variationtype.indexOf("color")) {
        productcolor = varient.productcolor;
      }
      break;
    }
  }
  let returnData = {
    productname: products.productname,
    productprice,
    productimage,
    quantity,
    uniqueid,
    productid: products._id,
    producttype: products.producttype,
    gstcategory: products.gstcategory,
    warrentycard: products.warrentycard,
    extradiscount: products.extradiscount,
    productdescription: products.productdescription,
    productdetails: products.productdetails,
    keywords: products.keywords,
  };
  if (isArrayEmpty(variationtype)) {
    return returnData;
  }
  if (variationtype.indexOf("color")) {
    returnData = { ...returnData, productcolor, variationtype };
  }
  return returnData;
};

const existUniqueidProduct = async function (shopinfoid, uniqueid) {
  const products = await getProductInfoFromUniqueid(shopinfoid, uniqueid);
  if (!isObjectEmpty(products)) {
    throw Api409Error("Conflict", "Product with This UniqueId Already Exist");
  }
};

const addProduct = async function (
  shopinfoid,
  productname,
  producttype,
  productvariations,
  productdescription,
  productdetails,
  gstcategory,
  warrentycard,
  extradiscount,
  keywords
) {
  // check product with this unique id already exist
  let uniqueidArray = [];
  if (!isArrayEmpty(productvariations)) {
    for (const varient of productvariations) {
      uniqueidArray.push(varient.uniqueid);
    }
  }
  for (const uniqueId of uniqueidArray) {
    const products = await getProductInfoFromUniqueid(shopinfoid, uniqueId);
    if (!isObjectEmpty(products)) {
      throw Api409Error(
        "Conflict",
        `Product with ${uniqueId} UniqueId Already Exist`
      );
    }
  }
  const insertOptions = {
    productname,
    producttype,
    productvariations,
    productdescription,
    productdetails,
    gstcategory,
    warrentycard,
    extradiscount,
    keywords,
    shopinfoid,
  };
  const products = await products.insertOne(insertOptions);
  const query = {
    _id: shopinfoid,
  };
  const options = {
    $push: {
      productids: products.insertedId,
    },
  };
  await shops.updateOne(query, options);
};

const getProductDataToRemove = async function (shopinfoid, uniqueid) {
  const products = await getProductInfoFromUniqueid(shopinfoid, uniqueid);
  if (isObjectEmpty(products)) {
    throw new Api404Error("Not found", "Not found");
  }
  let quantity, productcolor, productimage, variationtype, productprice;
  const variation = products.productvariations;
  for (const varient of variation) {
    if (varient.uniqueid == uniqueid) {
      quantity = varient.quantity;
      productprice = varient.productprice;
      productimage = varient.productimage;
      variationtype = varient.type;
      if (isArrayEmpty(variationtype)) {
        break;
      }
      if (variationtype.indexOf("color")) {
        productcolor = varient.productcolor;
      }
      break;
    }
  }
  let returnData = {
    productname: products.productname,
    productimage,
    quantity,
    productprice,
    productid: products._id,
  };
  if (isArrayEmpty(variationtype)) {
    return returnData;
  }
  if (variationtype.indexOf("color")) {
    returnData = { ...returnData, productcolor, variationtype };
  }
  return returnData;
};

const removeProduct = async function (productid, uniqueid, remquantity) {
  const query = {
    _id: productid,
    "productvariations.uniqueid": uniqueid,
  };
  const options = {
    $inc: {
      "productvariations.$.quantity": -remquantity,
    },
  };
  await products.updateOne(query, options);
};

const getProductDataToUpdate = async function (shopinfoid, uniqueid, ch) {
  const products = await getProductInfoFromUniqueid(shopinfoid, uniqueid);
  if (isObjectEmpty(products)) {
    throw new Api404Error("Not found", "Not found");
  }
  let quantity, productcolor, productimage, variationtype, productprice;
  const variation = products.productvariations;
  for (const varient of variation) {
    if (varient.uniqueid == uniqueid) {
      quantity = varient.quantity;
      productprice = varient.productprice;
      productimage = varient.productimage;
      variationtype = varient.type;
      if (isArrayEmpty(variationtype)) {
        break;
      }
      if (variationtype.indexOf("color")) {
        productcolor = varient.productcolor;
      }
      break;
    }
  }
  let returnData;
  if (ch == "basic") {
    // change name ,image , quantity or unique id
    returnData = {
      productname: products.productname,
      productimage,
      productprice,
      quantity,
      uniqueid,
      productid: products._id,
      producttype: products.producttype,
      gstcategory: products.gstcategory,
      extradiscount: products.extradiscount,
    };
  } else if (ch == "details") {
    returnData = {
      productname: products.productname,
      productimage,
      uniqueid,
      productid: products._id,
      productdescription: products.productdescription,
      productdetails: products.productdetails,
      warrentycard: products.warrentycard,
      keywords: products.keywords,
    };
  } else if (ch == "uniqueid") {
    returnData = {
      productname: products.productname,
      productimage,
      uniqueid,
      productid: products._id,
    };
  }
  if (isArrayEmpty(variationtype)) {
    return returnData;
  }
  if (variationtype.indexOf("color")) {
    returnData = { ...returnData, productcolor, variationtype };
  }
  return returnData;
};

const updateUniqueId = async function (olduniqueid, newuniqueid, productid) {
  const query = {
    _id: productid,
    "productvariations.uniqueid": olduniqueid,
  };
  const options = {
    $set: {
      "productvariations.$.uniqueid": newuniqueid,
    },
  };
  await products.updateOne(query, options);
};

const updateBasic = async function (
  productid,
  uniqueid,
  productname,
  productimage,
  productprice,
  variationtype,
  productcolor,
  quantity,
  producttype,
  gstcategory,
  extradiscount
) {
  const query = {
    _id: productid,
    "productvariations.uniqueid": uniqueid,
  };
  const options = {
    $set: {
      productname,
      producttype,
      gstcategory,
      extradiscount,
      "productvariations.$.productimage": productimage,
      "productvariations.$.productprice": productprice,
      "productvariations.$.productcolor": productcolor,
      "productvariations.$.type": variationtype,
      "productvariations.$.quantity": quantity,
    },
  };
  await products.updateOne(query, options);
};

const updateDetails = async function (
  productid,
  productdescription,
  productdetails,
  warrentycard,
  keywords
) {
  const query = {
    _id: productid,
  };
  const options = {
    $set: {
      productdescription,
      productdetails,
      warrentycard,
      keywords,
    },
  };
  await products.updateOne(query, options);
};

module.exports = {
  getShops,
  existUniqueidProduct,
  addProduct,
  getProductDataToRemove,
  removeProduct,
  getProductDataToUpdate,
  updateUniqueId,
  updateBasic,
  updateDetails,
  getAllProductInShop,
  getSingleProductFromShop,
  getSingleProductByUniqueId,
};
