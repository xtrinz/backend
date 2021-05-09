const { shops, orders } = require("../connect");

class BaseError extends Error {
  constructor(name, statusCode, isOperational, description) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}

class Api404Error extends BaseError {
  constructor(
    name = "Not found",
    description = "Not found",
    statusCode = code.NOT_FOUND,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

const isObjectEmpty = function (obj)
{
  return typeof obj != "object" || Object.keys(obj).length === 0
}

const isArrayEmpty = function (arr)
{
  return !Array.isArray(arr) || arr.length == 0
}

const getPaymentStatement = async function (shopinfoid) {
  const query1 = {
    _id: shopinfoid,
  };
  const shopinfo = await shops.findOne(query1);
  if (isObjectEmpty(shopinfo)) {
    throw new Api404Error();
  }
  if (isArrayEmpty(shopinfo.shoporderhistoryid)) {
    return;
  }
  const query2 = {
    _id: {
      $in: shopinfo.shoporderhistoryids,
    },
  };
  const shoporderhistory = await orders.find(query2);
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
  const shopinfo = await shops.findOne(query1);
  if (isObjectEmpty(shopinfo)) {
    throw new Api404Error();
  }
  if (isArrayEmpty(shopinfo.shoporderhistoryid)) {
    return;
  }
  const query2 = {
    _id: {
      $in: shopinfo.shoporderhistoryids,
    },
    paymentstatus: false,
  };
  const shoporderhistory = await orders.find(query2);
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
  const shopinfo = await shops.findOne(query1);
  if (isObjectEmpty(shopinfo)) {
    throw new Api404Error();
  }
  if (isArrayEmpty(shopinfo.shoporderhistoryid)) {
    return;
  }
  const query2 = {
    _id: {
      $in: shopinfo.shoporderhistoryids,
    },
    paymentstatus: true,
  };
  const shoporderhistory = await orders.find(query2);
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
