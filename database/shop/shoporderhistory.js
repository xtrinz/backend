const { isObjectEmpty, isArrayEmpty } = require("../../common/utils");
const { Api404Error } = require("../../error/errorclass/errorclass");
const { shops, orders } = require("../connect");

const dataForShopOrderHistory = async function (shopinfoid) {
  const query1 = {
    _id: shopinfoid,
  };
  const shopinfo = await shops.findOne(query1);
  if (isObjectEmpty(shopinfo)) {
    throw new Api404Error();
  }
  const query2 = {
    _id: {
      $in: shopinfo.shoporderhistoryid,
    },
  };
  let data = [];
  const shoporderhistory = await orders.find(query2);
  for await (const order of shoporderhistory) {
    const arrayData = {
      orderid: order._id,
      status: order.orderstatus,
      count: order.products.length,
      date: order.createddate, // we need date and time
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
  const shoporderhistory = await orders.findOne(query);
  if (isObjectEmpty(shoporderhistory)) {
    throw new Api404Error();
  }
  for (const products of shoporderhistory.products) {
    let arrayData = {
      shopid: products.shopinfoid,
      shopname: products.shopname,
      productid: products.productsid,
      productname: products.productname,
      productimage: products.productimage,
      productprice: products.productprice,
      quantity: products.quantity,
      uniqueId: products.uniqueid,
    };
    if (variationtype.indexOf("color")) {
      arrayData = {
        ...arrayData,
        productcolor: products.productcolor,
        variationtype: products.type,
      };
    }
    dataForId.push(arrayData);
  }
  const returnData = {
    dataForId,
    totalprice: shoporderhistory.totalprice,
    status: shoporderhistory.orderstatus,
  };
  return returnData;
};

module.exports = {
  dataForShopOrderHistory,
  dataForOrderStatusPage,
};
