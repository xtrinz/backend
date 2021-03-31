const { ObjectId } = require("mongodb");
const {
  userCollection,
  purchaseHistoryCollection,
  shopInfoCollection,
  productsCollection,
} = require("../databaseconnections/mongoconnection");
const { Api404Error, Api403Error } = require("../error/errorclass/errorclass");
const { isArrayEmpty, compareTwo } = require("../functions");

// retrieve purchase data
const dataForOrderHistory = async function (user) {
  const data = [];
  /**
   * loop throgh array of purchase id
   * query purchase history with that id to retrieve info regarding purchase
   */
  for (const purchaseId of user.purchaseid) {
    const query1 = {
      _id: ObjectId(purchaseId),
    };
    const options1 = {
      projection: {
        products: 1,
        statusdelivery: 1,
        totalPrice: 1,
      },
    };
    let purchaseHistory = await purchaseHistoryCollection.findOne(
      query1,
      options1
    );
    if (!purchaseHistory) {
      // if we can't find any document matching that . then we should remove that purchase id from user collection
      const query2 = {
        _id: ObjectId(user._id),
      };
      const options2 = {
        $pull: {
          purchaseid: ObjectId(purchaseId),
        },
      };
      await userCollection.updateOne(query2, options2);
      continue;
    }
    const arrayData = {
      itemCount: purchaseHistory.products.length,
      statusdelivery: purchaseHistory.statusdelivery,
      totalPrice: purchaseHistory.totalPrice,
      purchaseId: purchaseId,
    };
    data.push(arrayData);
  }
  return data;
};

// place order request coming from payment page
const placeOrderAddDataToOrderHistory = async function (
  user,
  customername,
  phonenumber,
  addressid
) {
  let products = [];
  let totalPrice = 0;
  if (isArrayEmpty(user.address)) {
    throw new Api403Error(
      "Forbidden",
      "Please provide an address to deliver your item"
    );
  }
  let delAddress;
  for (const address of user.address) {
    if (compareTwo(address._id, addressid)) {
      delAddress = address;
      break;
    }
  }
  if (!delAddress) {
    throw new Api403Error(
      "Forbidden",
      "Please provide an address to deliver your item"
    );
  }
  if (isArrayEmpty(user.temporaryproducts)) {
    throw new Api403Error("Forbidden", "Please checkout your cart");
  }
  // loop through temporary products and take price of that products from shopproduct collection
  // project methode is used to retrieve a specific field in a collection
  // $elemMatch is used for giving more specification
  // refer mongodb doc for more info
  for (let product of user.temporaryproducts) {
    const query1 = {
      _id: ObjectId(product.shopinfoid),
    };
    const options1 = {
      projection: {
        products: { $elemMatch: { productid: ObjectId(product.productsid) } },
        _id: 0,
      },
    };
    const shopinfo = await shopInfoCollection.findOne(query1, options1);
    if (!shopinfo) {
      const query2 = {
        _id: ObjectId(user._id),
      };
      const options2 = {
        $pull: {
          temporaryproducts: {
            _id: ObjectId(product._id),
          },
        },
      };
      await userCollection.updateOne(query2, options2);
      continue;
    } // Todo : stock status should be consider
    const arrayData = {
      ...product,
      price: shopinfo.products[0].price,
    };
    products.push(arrayData);
  }
  if (isArrayEmpty(products)) {
    throw new Api404Error(
      "Not found",
      "Something went wrong. Please try again"
    );
  }
  // calculate total price
  for (const { price, quantity } of products) {
    totalPrice = totalPrice + price * quantity;
  }
  const insertData = {
    userid: ObjectId(user._id),
    customername,
    phonenumber,
    products,
    totalPrice,
    location: delAddress,
    statusdelivery: "ongoing",
    isdelivered: false,
  };
  // update all the info regarding the purchase into purchase history collection
  const insertedData = await purchaseHistoryCollection.insertOne(insertData);
  const query3 = {
    _id: ObjectId(user._id),
  };
  const options3 = {
    $push: {
      purchaseid: insertedData.insertedId,
    },
  };
  // retrieve the purchase id of that purchase and store that in user collection
  await userCollection.updateOne(query3, options3);
  return insertedData.insertedId;
};

const dataForOrderStatusPage = async function (user, purchaseId) {
  //retrieve that purchase id from user collection (it is basically a double check to make sure that purchase id belongs to that user)
  const idMatches = user.purchaseid.some(id => id == purchaseId);
  if (!idMatches) {
    throw new Api404Error("Not Found", "Not found");
  }
  // retrieve info about that purchase id from purchase history
  const query1 = {
    _id: ObjectId(purchaseId),
  };
  const options1 = {
    projection: {
      _id: 0,
    },
  };
  const purchaseHistory = await purchaseHistoryCollection.findOne(
    query1,
    options1
  );
  if (!purchaseHistory) {
    const query2 = {
      _id: ObjectId(user._id),
    };
    const options2 = {
      $pull: {
        purchaseid: ObjectId(purchaseId),
      },
    };
    await userCollection.updateOne(query2, options2);
    // we should send error message here. because api requested this data specifically. but couldn't find one that matching the request
    throw new Api404Error("Not Found", "Not found");
  }
  const dataForId = [];
  const uniqueShopIds = [];
  const uniqueLocations = [];
  if (purchaseHistory.products) {
    // then detatiled info from shopinfo and products
    for (const purchaseHistoryProduct of purchaseHistory.products) {
      const {
        shopinfoid,
        productsid,
        price,
        quantity,
      } = purchaseHistoryProduct;
      const query3 = {
        _id: ObjectId(shopinfoid),
      };
      const options3 = {
        projection: {
          _id: 1,
          shopname: 1,
        },
      };
      // Todo : how do we handle if shop closed permenetly?. or change their name or location
      // Todo : error handling . we can't just delete data if shopinfo or products empty. because purchase is already happened so we must show
      // status to customer if they requested
      const shopinfo = await shopInfoCollection.findOne(query3, options3);
      const query4 = {
        _id: ObjectId(productsid),
      };
      const options4 = {
        projection: {
          _id: 1,
          productname: 1,
          productimage: 1,
        },
      };
      const products = await productsCollection.findOne(query4, options4);
      const arrayData = {
        shopId: shopinfo._id,
        shopName: shopinfo.shopname,
        productid: products._id,
        productName: products.productname,
        productImage: products.productimage,
        price: price,
        quantity: quantity,
      };
      dataForId.push(arrayData);
      //make an array that contain location of shop
      // this is used for rendering direction on google map
      if (!purchaseHistory.isdelivered) {
        if (uniqueShopIds.indexOf(shopinfo._id.toString()) == -1) {
          // this is required only if the delivery didn't happen
          uniqueShopIds.push(shopinfo._id.toString());
          uniqueLocations.push({
            ...shopinfo.location,
            content: shopinfo.shopname,
          });
        }
      }
    }
  }

  let returnData = {
    dataForId,
    statusdelivery: purchaseHistory.statusdelivery,
    totalPrice: purchaseHistory.totalPrice,
    deliveryLocation: {
      ...purchaseHistory.location,
      content: "Delivery Location",
    },
  };
  if (!purchaseHistory.isdelivered) {
    returnData = { ...returnData, uniqueLocations };
  }
  return returnData;
};

module.exports = {
  dataForOrderHistory,
  placeOrderAddDataToOrderHistory,
  dataForOrderStatusPage,
};
