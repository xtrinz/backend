const { ObjectId } = require("mongodb");
const {
  userCollection,
  purchaseHistoryCollection,
  shopInfoCollection,
  productsCollection,
} = require("../databaseconnections/mongoconnection");
const { validatePhoneNumber } = require("../functions");

// retrieve purchase data
const dataForOrderHistory = async function (userid) {
  // retrieve purchaseid
  // project methode return only options that mentioned inside it
  // for more info refer mongodb doc
  const query1 = {
    _id: ObjectId(userid),
  };
  const options1 = {
    projection: {
      purchaseid: 1,
    },
  };
  const user = await userCollection.findOne(query1, options1);
  const data = [];
  /**
   * loop throgh array of purchase id
   * query purchase history with that id to retrieve info regarding purchase
   */
  for (const purchaseId of user.purchaseid) {
    const query2 = {
      _id: ObjectId(purchaseId),
    };
    const options2 = {
      projection: {
        products: 1,
        statusdelivery: 1,
        totalPrice: 1,
      },
    };
    const orderHistory = await purchaseHistoryCollection.findOne(
      query2,
      options2
    );
    const arrayData = {
      itemCount: orderHistory.products.length,
      statusdelivery: orderHistory.statusdelivery,
      totalPrice: orderHistory.totalPrice,
      purchaseId: purchaseId,
    };
    data.push(arrayData);
  }
  return data;
};

// place order request coming from payment page
const placeOrderAddDataToOrderHistory = async function (
  userid,
  customername,
  phonenumber,
  lat,
  lng
) {
  // verify wheather phone number a avalid one or not
  phonenumber = validatePhoneNumber(phonenumber);
  // retrieve product details from temporaryproducts from user collection
  const query1 = {
    _id: ObjectId(userid),
  };
  const options1 = {
    projection: {
      _id: 0,
      temporaryproducts: 1,
    },
  };
  const user = await userCollection.findOne(query1, options1);
  let products = [];
  let totalPrice = 0;
  // loop through temporary products and take price of that products from shopproduct collection
  // project methode is used to retrieve a specific field in a collection
  // $elemMatch is used for giving more specification
  // refer mongodb doc for more info
  for (let product of user.temporaryproducts) {
    const query2 = {
      _id: ObjectId(product.shopinfoid),
    };
    const options2 = {
      projection: {
        products: { $elemMatch: { productid: ObjectId(product.productsid) } },
        _id: 0,
      },
    };
    const shopinfo = await shopInfoCollection.findOne(query2, options2);
    const arrayData = {
      ...product,
      price: shopinfo.products[0].price,
    };
    products.push(arrayData);
  }
  // calculate total price
  for (const { price, quantity } of products) {
    totalPrice = totalPrice + price * quantity;
  }
  const insertData = {
    userid: ObjectId(userid),
    customername,
    phonenumber,
    products,
    totalPrice,
    location: { lat, lng },
    statusdelivery: "ongoing",
  };
  // update all the info regarding the purchase into purchase history collection
  const insertedData = await purchaseHistoryCollection.insertOne(insertData);
  const query3 = {
    _id: ObjectId(userid),
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

const dataForOrderStatusPage = async function (userid, purchaseId) {
  //retrieve that purchase id from user collection (it is basically a double check to make sure that purchase id belongs to that user)
  const query1 = {
    _id: ObjectId(userid),
    purchaseid: ObjectId(purchaseId),
  };
  const options1 = {
    projection: {
      purchaseid: { $elemMatch: { $eq: ObjectId(purchaseId) } },
    },
  };
  const user = await userCollection.findOne(query1, options1);
  // retrieve info about that purchase id from purchase history
  const query2 = {
    _id: ObjectId(user.purchaseid[0]),
  };
  const options2 = {
    projection: {
      _id: 0,
    },
  };
  const purchaseHistory = await purchaseHistoryCollection.findOne(
    query2,
    options2
  );
  const dataForId = [];
  const uniqueShopIds = [];
  const uniqueLocations = [];
  // then detatiled info from shopinfo and products
  for (const purchaseHistoryProduct of purchaseHistory.products) {
    const { shopinfoid, productsid, price, quantity } = purchaseHistoryProduct;
    const query3 = {
      _id: ObjectId(shopinfoid),
    };
    const options3 = {
      projection: {
        _id: 1,
        shopname: 1,
      },
    };
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
    if (uniqueShopIds.indexOf(shopinfo._id.toString()) == -1) {
      uniqueShopIds.push(shopinfo._id.toString());
      uniqueLocations.push({
        ...shopinfo.location,
        content: shopinfo.shopname,
      });
    }
  }
  const returnData = {
    dataForId,
    statusdelivery: purchaseHistory.statusdelivery,
    totalPrice: purchaseHistory.totalPrice,
    uniqueLocations,
    deliveryLocation: {
      ...purchaseHistory.location,
      content: "Delivery Location",
    },
  };
  return returnData;
};

module.exports.dataForOrderHistory = dataForOrderHistory;
module.exports.placeOrderAddDataToOrderHistory = placeOrderAddDataToOrderHistory;
module.exports.dataForOrderStatusPage = dataForOrderStatusPage;
