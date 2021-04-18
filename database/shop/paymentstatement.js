const {
  shopInfoCollection,
  shopOrderHistoryCollection,
} = require("../connect");

const getPaymentStatement = async function (shopinfoid) {
  const query1 = {
    _id: shopinfoid,
  };
  const shopinfo = await shopInfoCollection.findOne(query1);
  const query2 = {
    _id: {
      $in: shopinfo.shoporderhistoryid,
    },
  };
  const shoporderhistory = await shopOrderHistoryCollection.find(query2);
  let data = [];
  let total = 0,
    success = 0,
    pending = 0;
  for await (const order of shoporderhistory) {
    total++;
    if (order.paymentstatus == true) {
      success++;
    } else {
      pending++;
    }
    const arrayData = {
      orderDate: order.createddate, // we need date and time
      paymentDate: order.paymentdate,
      paymentStatus: order.paymentstatus,
    };
    data.push(arrayData);
  }
  const returnData = {
    total,
    success,
    pending,
    data,
  };
  return returnData;
};

const getPendingPaymentStatement = async function (shopinfoid) {
  const query1 = {
    _id: shopinfoid,
  };
  const shopinfo = await shopInfoCollection.findOne(query1);
  const query2 = {
    _id: {
      $in: shopinfo.shoporderhistoryid,
    },
    paymentstatus: false,
  };
  const shoporderhistory = await shopOrderHistoryCollection.find(query2);
  let data = [];
  for await (const order of shoporderhistory) {
    const arrayData = {
      orderDate: order.createddate, // we need date and time
      paymentDate: order.paymentdate,
      paymentStatus: order.paymentstatus,
    };
    data.push(arrayData);
  }
  return data;
};

const getSuccessPaymentStatement = async function (shopinfoid) {
  const query1 = {
    _id: shopinfoid,
  };
  const shopinfo = await shopInfoCollection.findOne(query1);
  const query2 = {
    _id: {
      $in: shopinfo.shoporderhistoryid,
    },
    paymentstatus: true,
  };
  const shoporderhistory = await shopOrderHistoryCollection.find(query2);
  let data = [];
  for await (const order of shoporderhistory) {
    const arrayData = {
      orderDate: order.createddate, // we need date and time
      paymentDate: order.paymentdate,
      paymentStatus: order.paymentstatus,
    };
    data.push(arrayData);
  }
  return data;
};

module.exports = {
  getPaymentStatement,
  getPendingPaymentStatement,
  getSuccessPaymentStatement,
};
