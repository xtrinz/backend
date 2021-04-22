const { ObjectId } = require("mongodb");
const { users, purchases } = require("../connect");
const { Api404Error } = require("../../error/errorclass/errorclass");

// retrieve purchase data
const dataForOrderHistory = async function (user) {
  const data = [];
  /**
   * loop throgh array of purchase id
   * query purchase history with that id to retrieve info regarding purchase
   */
  const query1 = {
    _id: {
      $in: user.purchaseid,
    },
  };
  let purchaseHistory = await purchases.find(query1);
  for await (const order of purchaseHistory) {
    const arrayData = {
      itemCount: order.products.length,
      statusdelivery: order.statusdelivery,
      totalPrice: order.totalPrice,
      purchaseId: order._id,
    };
    data.push(arrayData);
  }
  return data;
};

const dataForOrderStatusPage = async function (user, purchaseId) {
  //retrieve that purchase id from user collection (it is basically a double check to make sure that purchase id belongs to that user)
  const idMatches = user.purchaseid.some(id => id == purchaseId);
  if (!idMatches) {
    throw new Api404Error("Not Found", "Not found");
  }
  // retrieve info about that purchase id from purchase history
  const query1 = {
    _id: purchaseId,
  };
  const options1 = {
    projection: {
      _id: 0,
    },
  };
  const purchaseHistory = await purchases.findOne(
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
    await users.updateOne(query2, options2);
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
        shopname,
        productsid,
        productname,
        productimage,
        productcolor,
        uniqueid,
        variation,
        productprice,
        quantity,
      } = purchaseHistoryProduct;
      // Todo : how do we handle if shop closed permenetly?. or change their name or location
      // Todo : error handling . we can't just delete data if shopinfo or products empty. because purchase is already happened so we must show
      // status to customer if they requested
      const arrayData = {
        shopId: shopinfoid,
        shopName: shopname,
        productid: productsid,
        productName: productname,
        productImage: productimage,
        productprice: productprice,
        quantity: quantity,
        productColor: productcolor,
        uniqueId: uniqueid,
        variation: variation,
      };
      dataForId.push(arrayData);
      //make an array that contain location of shop
      // this is used for rendering direction on google map
      // I think this is not required now (It will make our app complicated at initial stage
      // and we are now focusing on electronics so tight delivery not required(food delivery it is required because people may eagorly waiting for food))
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
      ...purchaseHistory.address,
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
  dataForOrderStatusPage,
};
