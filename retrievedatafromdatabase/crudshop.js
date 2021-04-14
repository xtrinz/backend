const {
  productsCollection,
  shopInfoCollection,
} = require("../databaseconnections/mongoconnection");

const addProduct = async function (
  shopinfoid,
  productname,
  producttype,
  productvariations,
  productdescription,
  productdetails,
  uniqueid,
  gstcategory,
  warrentycard,
  extradiscount,
  keywords
) {
  const insertOptions = {
    uniqueid,
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
  const products = await productsCollection.insertOne(insertOptions);
  const query = {
    _id: shopinfoid,
  };
  const options = {
    $push: {
      products: products.insertedId,
    },
  };
  await shopInfoCollection.updateOne(query, options);
};

const getProductDataToRemove = async function (shopinfoid, uniqueid) {
  const query = {
    _id: shopinfoid,
  };
  const options = {
    $projection: {
      products: 1,
    },
  };
  const shopinfo = await shopInfoCollection.findOne(query, options);
  const query = {
    $and: [
      {
        _id: {
          $in: shopinfo.products,
        },
      },
      {
        $or: [
          {
            "productvariations.color.uniqueid": uniqueid,
          },
          {
            "productvariations.default.uniqueid": uniqueid,
          },
        ],
      },
    ],
  };
  const products = await productsCollection.findOne(query);
  let quantity, productcolor, productimage, variation;
  if (products.productvariations.default.uniqueid) {
    quantity = products.productvariations.default.quantity;
    productimage = products.productvariations.default.productimage;
    productcolor = products.productvariations.default.productcolor;
    variation = "default";
  } else if (products.productvariations.color) {
    for (const varient of products.productvariations.color) {
      if (varient.uniqueid == uniqueid) {
        quantity = products.productvariations.color.quantity;
        productimage = products.productvariations.color.productimage;
        productcolor = products.productvariations.color.productcolor;
        variation = "color";
      }
    }
  }
  const returnData = {
    productname: products.productname,
    productimage,
    productcolor,
    quantity,
    variation,
    productid: products._id,
  };
  return returnData;
};

const removeProduct = async function (
  productid,
  uniqueid,
  remquantity,
  variation
) {
  let query, options;
  if (variation == "default") {
    query = {
      _id: productid,
      "productvariations.default.uniqueid": uniqueid,
    };
    options = {
      $inc: {
        "productvariations.default.quantity": -remquantity,
      },
    };
  } else if (variation == "color") {
    query = {
      _id: productid,
      "productvariations.color.uniqueid": uniqueid,
    };
    options = {
      $inc: {
        "productvariations.color.$.quantity": -remquantity,
      },
    };
  }
  await productsCollection.updateOne(query, options);
};

const getProductDataToUpdate = async function (shopinfoid, uniqueid, ch) {
  const query = {
    _id: shopinfoid,
  };
  const options = {
    $projection: {
      products: 1,
    },
  };
  const shopinfo = await shopInfoCollection.findOne(query, options);
  const query = {
    $and: [
      {
        _id: {
          $in: shopinfo.products,
        },
      },
      {
        $or: [
          {
            "productvariations.color.uniqueid": uniqueid,
          },
          {
            "productvariations.default.uniqueid": uniqueid,
          },
        ],
      },
    ],
  };
  const products = await productsCollection.findOne(query);
  let quantity, productcolor, productimage, variation;
  if (products.productvariations.default.uniqueid) {
    quantity = products.productvariations.default.quantity;
    productimage = products.productvariations.default.productimage;
    productcolor = products.productvariations.default.productcolor; // none
    variation = "default";
  } else if (products.productvariations.color) {
    for (const varient of products.productvariations.color) {
      if (varient.uniqueid == uniqueid) {
        quantity = products.productvariations.color.quantity;
        productimage = products.productvariations.color.productimage;
        productcolor = products.productvariations.color.productcolor;
        variation = "color";
      }
    }
  }
  let returnData;
  if (ch == "basic") {
    // change name ,image , quantity or unique id
    returnData = {
      productname: products.productname,
      productimage,
      productcolor,
      quantity,
      variation,
      uniqueid,
      productid: products._id,
      producttype: products.producttype,
      gstcategory: products.gstcategory,
      warrentycard: products.warrentycard,
      extradiscount: products.extradiscount,
      keywords: products.keywords,
    };
  } else if (ch == "details") {
    returnData = {
      productname: products.productname,
      productimage,
      productcolor,
      variation,
      uniqueid,
      productid: products._id,
      productdescription: products.productdescription,
      productdetails: products.productdetails,
    };
  } else if (ch == "uniqueid") {
    returnData = {
      productname: products.productname,
      productimage,
      productcolor,
      variation,
      uniqueid,
      productid: products._id,
    };
  }
  return returnData;
};

const updateUniqueId = async function (
  olduniqueid,
  newuniqueid,
  productid,
  variation
) {
  let query, options;
  if (variation == "default") {
    query = {
      _id: productid,
      "productvariations.default.uniqueid": olduniqueid,
    };
    options = {
      $set: {
        "productvariations.default.uniqueid": newuniqueid,
      },
    };
  } else if (variation == "color") {
    query = {
      _id: productid,
      "productvariations.color.uniqueid": olduniqueid,
    };
    options = {
      $set: {
        "productvariations.color.$.uniqueid": newuniqueid,
      },
    };
  }
  await productsCollection.updateOne(query, options);
};

module.exports = {
  addProduct,
  getProductDataToRemove,
  removeProduct,
  getProductDataToUpdate,
  updateUniqueId,
};
