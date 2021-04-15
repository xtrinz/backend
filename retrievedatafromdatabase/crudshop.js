const {
  productsCollection,
  shopInfoCollection,
} = require("../databaseconnections/mongoconnection");
const { Api409Error } = require("../error/errorclass/errorclass");

const getProductInfoFromUniqueid = async function (shopinfoid, uniqueid) {
  const query1 = {
    _id: shopinfoid,
  };
  const options1 = {
    $projection: {
      products: 1,
    },
  };
  const shopinfo = await shopInfoCollection.findOne(query1, options1);
  const query2 = {
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
  const products = await productsCollection.findOne(query2);
  return products;
};

const getAllProductInShop = async function (shopinfoid) {
  const query1 = {
    _id: shopinfoid,
  };
  const options1 = {
    $projection: {
      products: 1,
      shopname: 1,
    },
  };
  const shopinfo = await shopInfoCollection.findOne(query1, options1);
  const query2 = {
    _id: {
      $in: shopinfo.products,
    },
  };
  let products = await productsCollection.find(query2);
  products = products.toArray();
  let data = [];
  for (const product of products) {
    const arrayData = {
      shopname: shopinfo.shopname,
      productname: product.productname,
      productimage: product.productimage,
      productvariations: product.productvariations,
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
  const shopinfo = await shopInfoCollection.findOne(query1, options1);
  const query2 = {
    _id: productid,
    shopinfoid: shopinfoid,
  };
  const products = await productsCollection.findOne(query2);
  const returnData = {
    shopname: shopinfo.shopname,
    productname: products.productname,
    productimage: products.productimage,
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
  const returnData = {
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
    productdescription: products.productdescription,
    productdetails: products.productdetails,
  };
  return returnData;
};

const existUniqueidProduct = async function (shopinfoid, uniqueid) {
  const products = await getProductInfoFromUniqueid(shopinfoid, uniqueid);
  if (products) {
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
  let uniqueidArray = [];
  if (productvariations.default) {
    uniqueidArray.push(productvariations.default.uniqueid);
  } else if (productvariations.color) {
    for (const varient of productvariations.color) {
      uniqueidArray.push(varient.uniqueid);
    }
  }
  for (const uniqueId of uniqueidArray) {
    const products = await getProductInfoFromUniqueid(shopinfoid, uniqueId);
    if (products) {
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
  const products = await getProductInfoFromUniqueid(shopinfoid, uniqueid);
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
  const products = await getProductInfoFromUniqueid(shopinfoid, uniqueid);
  let quantity, productcolor, productimage, variation;
  if (products.productvariations.default) {
    quantity = products.productvariations.default.quantity;
    productimage = products.productvariations.default.productimage;
    productcolor = products.productvariations.default.productcolor; // none
    variation = "default";
  } else if (products.productvariations.color) {
    for (const varient of products.productvariations.color) {
      if (varient.uniqueid == uniqueid) {
        quantity = varient.quantity;
        productimage = varient.productimage;
        productcolor = varient.productcolor;
        variation = "color";
        break;
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

const updateBasic = async function (
  productid,
  productname,
  producttype,
  gstcategory,
  warrentycard,
  extradiscount,
  keywords
) {
  const query = {
    _id: productid,
  };
  const options = {
    $set: {
      productname,
      producttype,
      gstcategory,
      warrentycard,
      extradiscount,
      keywords,
    },
  };
  await productsCollection.updateOne(query, options);
};

const updateDetails = async function (
  productid,
  productdescription,
  productdetails
) {
  const query = {
    _id: productid,
  };
  const options = {
    $set: {
      productdescription,
      productdetails,
    },
  };
  await productsCollection.updateOne(query, options);
};

module.exports = {
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
