const {
  shopInfoCollection,
  shopOrderHistoryCollection,
} = require("../connect");

const dataForShopOrderHistory = async function (shopinfoid) {
  const query1 = {
    _id: shopinfoid,
  };
  const shopinfo = await shopInfoCollection.findOne(query1);
  const query2 = {
    _id: {
      $in: shopinfo.shoporderhistoryid,
    },
  };
  let data = [];
  const shoporderhistory = await shopOrderHistoryCollection.find(query2);
  for await (const order of shoporderhistory) {
    const arrayData = {
      Status: order.orderstatus,
      Count: order.products.length,
      data: order.createddate, // we need date and time
    };
    data.push(arrayData);
  }
  return data;
};

const dataForOrderStatusPage = async function (shopinfoid, orderid) {
  const query = {
    _id: orderid,
    shopinfoid: shopinfoid,
  };
  let dataForId = [];
  const shoporderhistory = await shopOrderHistoryCollection.findOne(query);
  for (const products of shoporderhistory) {
    const arrayData = {
      shopId: products.shopinfoid,
      shopName: products.shopname,
      productid: products.productsid,
      productName: products.productname,
      productImage: products.productimage,
      productprice: products.productprice,
      quantity: products.quantity,
      productColor: products.productcolor,
      uniqueId: products.uniqueid,
      variation: products.variation,
    };
    dataForId.push(arrayData);
  }
  const returnData = {
    dataForId,
    totalPrice: shoporderhistory.totalprice,
    status: shoporderhistory.orderstatus,
  };
  return returnData;
};

module.exports = {
  dataForShopOrderHistory,
  dataForOrderStatusPage,
};
