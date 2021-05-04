require("dotenv").config();
const { ObjectID } = require("mongodb");
const {
  users,
  shops,
  products,
  carts,
  sessions,
  purchases,
} = require("../connect");
const {
  Api403Error,
  Api404Error,
} = require("../../error/errorclass/errorclass");
const { isArrayEmpty, isObjectEmpty } = require("../../common/utils");
const JWT_SESSION_TOKEN_SECRET = process.env.JWT_SESSION_TOKEN_SECRET;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

const stripe = require("stripe")(stripeSecretKey);

// data for payment page
const dataForPaymentPage = async function (session) {
  let data = [];
  let totalPrice = 0;
  // get detatiled info regarding product from shop info and products

  if (
    isObjectEmpty(session.transaction) ||
    isArrayEmpty(session.transaction.temporaryproducts)
  ) {
    throw new Api403Error("Forbidden", "Please checkout your cart");
  }
  const temporaryproducts = session.transaction.temporaryproducts;
  for (let product of temporaryproducts) {
    const query1 = {
      _id: product.shopinfoid,
    };
    const options1 = {
      projection: {
        _id: 1,
        shopname: 1,
      },
    };
    const shopinfo = await shops.findOne(query1, options1);
    const query2 = {
      _id: product.productsid,
      shopinfoid: product.shopinfoid,
      "productvariations.color.uniqueid": product.uniqueid,
    };
    const product1 = await products.findOne(query2);
    if (isObjectEmpty(shopinfo) || isObjectEmpty(products)) {
      const query3 = {
        _id: session._id,
      };
      const options3 = {
        $pull: {
          "transaction.$.temporaryproducts": {
            _id: product._id,
          },
        },
      };
      await sessions.updateOne(query3, options3);
      continue;
    }
    let quantity, productcolor, productimage, variationtype, productprice;
    const variation = product1.productvariations;
    for (const varient of variation) {
      if (varient.uniqueid == uniqueid) {
        quantity = varient.quantity;
        productprice = varient.productprice;
        productimage = varient.productimage;
        variationtype = varient.type;
        if (variationtype.indexOf("color")) {
          productcolor = varient.productcolor;
        }
        break;
      }
    }
    let arrayData = {
      shopinfoid: shopinfo._id,
      shopname: shopinfo.shopname,
      productid: product1._id,
      productname: product1.productname,
      productimage,
      productprice,
      uniqueid: product.uniqueid,
      quantity: product.quantity,
    };
    if (variationtype.indexOf("color")) {
      arrayData = { ...arrayData, productcolor, variationtype };
    }
    data.push(arrayData);
  }
  if (isArrayEmpty(data)) {
    throw new Api404Error(
      "Not found",
      "Something went wrong. Please try again"
    );
  }
  // calculate total price
  for (const { productprice, quantity } of data) {
    totalPrice = totalPrice + productprice * quantity;
  }
  const returnData = {
    data,
    totalPrice,
  };
  return returnData;
};

const addTemporaryProductInUserForPaymentPage = async function (
  user,
  isRequestFromCart,
  quantity,
  shopinfoid,
  productsid,
  uniqueid
) {
  let temporaryData = [];
  if (isRequestFromCart) {
    const query1 = {
      _id: user.cartid,
    };
    const options1 = {
      projection: {
        products: 1,
      },
    };
    let cart = await carts.findOne(query1, options1);
    if (isObjectEmpty(cart)) {
      const insertOptions = {
        products: [],
      };
      cart = await carts.insertOne(insertOptions);
      const query2 = {
        _id: user._id,
      };
      const options2 = {
        $set: {
          cartid: cart.insertedId,
        },
      };
      await users.updateOne(query2, options2);
      // we should send error because request to this api forbidden for the above error case
      throw new Api403Error(
        "Forbidden",
        "Something went wrong. Please try again"
      );
    }
    if (isArrayEmpty(cart.products)) {
      throw new Api403Error(
        "Forbidden",
        "Your cart is empty. Please add items to your cart"
      );
    }
    temporaryData = cart.products;
  } else {
    const arrayData = {
      _id: new ObjectID(),
      shopinfoid,
      productsid,
      uniqueid,
      quantity,
    };
    temporaryData.push(arrayData);
  }
  const insertOptions = {
    userid: user._id,
    transaction: {
      temporaryproducts: temporaryData,
    },
  };
  const session = await sessions.insertOne(insertOptions);
  const token = jwt.sign({ _id: session.insertedId }, JWT_SESSION_TOKEN_SECRET);
  return token;
};

const getDefaultAddress = function (user) {
  let delAddress;
  for (const address of user.address) {
    if (address.isdefault) {
      delAddress = address;
      break;
    } else {
      if (user.lastdeladdressid == address._id) {
        delAddress = address;
      }
    }
  }
  const returnData = {
    customername: user.firstname + " " + user.lastname,
    phonnumber: user.phonnumber,
    delAddress,
  };
  return returnData;
};

const calculateOrderAmount = async function (session) {
  let cartValue = 0;
  if (
    isObjectEmpty(session.transaction) ||
    isArrayEmpty(session.transaction.temporaryproducts)
  ) {
    throw new Api403Error("Forbidden", "Please checkout your cart");
  }

  const temporaryproducts = session.transaction.temporaryproducts;
  for (let product of temporaryproducts) {
    const query2 = {
      _id: product.productsid,
      shopinfoid: product.shopinfoid,
      "productvariations.uniqueid": product.uniqueid,
    };
    const product1 = await products.findOne(query2);
    if (isObjectEmpty(product1)) {
      const query3 = {
        _id: session._id,
      };
      const options3 = {
        $pull: {
          "transaction.$.temporaryproducts": {
            _id: product._id,
          },
        },
      };
      await sessions.updateOne(query3, options3);
      continue;
    }
    let productprice;
    if (product1.productvariations) {
      for (const varient of product1.productvariations) {
        if (varient.uniqueid == product.uniqueid) {
          productprice = varient.productprice;
          break;
        }
      }
    }
    cartValue = cartValue + productprice;
  }
  // Todo : Delivery Charge need to be calculated
  const returnData = {
    cartValue,
    delCharge: 0,
    totalPrice: cartValue + delCharge,
  };
  return returnData;
};

// place order request coming from payment page
const placeOrder = async function (
  user,
  session,
  customername,
  phonenumber,
  addressid
) {
  let productData = [];
  let totalPrice = 0;
  if (isArrayEmpty(user.address)) {
    throw new Api403Error(
      "Forbidden",
      "Please provide an address to deliver your item"
    );
  }
  let delAddress;
  for (const address of user.address) {
    if (address._id == addressid) {
      delAddress = address;
      break;
    }
  }
  if (isObjectEmpty(delAddress)) {
    throw new Api403Error(
      "Forbidden",
      "Please provide an address to deliver your item"
    );
  }
  if (
    isObjectEmpty(session.transaction) ||
    isArrayEmpty(session.transaction.temporaryproducts)
  ) {
    throw new Api403Error("Forbidden", "Please checkout your cart");
  }
  const temporaryproducts = session.transaction.temporaryproducts;
  for (let product of temporaryproducts) {
    const query1 = {
      _id: product.shopinfoid,
    };
    const options1 = {
      projection: {
        _id: 1,
        shopname: 1,
      },
    };
    const shopinfo = await shops.findOne(query1, options1);
    const query2 = {
      _id: product.productsid,
      shopinfoid: product.shopinfoid,
      "productvariations.uniqueid": product.uniqueid,
    };
    const product1 = await products.findOne(query2);
    if (isObjectEmpty(shopinfo) || isObjectEmpty(product1)) {
      const query3 = {
        _id: session._id,
      };
      const options3 = {
        $pull: {
          "transaction.$.temporaryproducts": {
            _id: product._id,
          },
        },
      };
      await sessions.updateOne(query3, options3);
      continue;
    } // Todo : stock status should be consider
    let quantity, productcolor, productimage, variationtype, productprice;
    const variation = product1.productvariations;
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
    let arrayData = {
      _id: new ObjectID(),
      shopinfoid: shopinfo._id,
      shopname: shopinfo.shopname,
      productid: products._id,
      productname: products.productname,
      productimage,
      productprice,
      uniqueid: product.uniqueid,
      quantity: product.quantity,
    };
    if (variationtype.indexOf("color")) {
      arrayData = { ...arrayData, productcolor, variationtype };
    }
    productData.push(arrayData);
  }
  if (isArrayEmpty(productData)) {
    throw new Api404Error(
      "Not found",
      "Something went wrong. Please try again"
    );
  }
  // calculate total price
  // Todo : we should consider all other charges too like delivery charge ,gst etc
  for (const { productprice, quantity } of productData) {
    totalPrice = totalPrice + productprice * quantity;
  }
  const insertData = {
    userid: user._id,
    customername,
    phonenumber,
    products: productData,
    totalPrice,
    address: delAddress,
    statusdelivery: "ongoing",
    isdelivered: false,
    paymentstatus: "pending",
  };
  // update all the info regarding the purchase into purchase history collection
  const insertedData = await purchases.insertOne(insertData);
  const purchaseid = insertedData.insertedId;
  const query4 = {
    _id: user._id,
  };
  const options4 = {
    $push: {
      purchaseid: purchaseid,
    },
  };
  // retrieve the purchase id of that purchase and store that in user collection
  await users.updateOne(query4, options4);
  const query5 = {
    _id: session._id,
  };
  const options5 = {
    $set: {
      "transaction.purchaseid": purchaseid,
    },
  };
  await sessions.updateOne(query5, options5);
};

const createPaymentIntent = async function (user, session, charges) {
  // allow only one user per account to access this and if any other user try to
  // access from same account at the same time then timout his session
  const paymentIntent = await stripe.paymentIntents.create({
    amount: charges.totalPrice * 100,
    currency: "inr",
    metadata: {
      userid: user._id,
      sessionid: session._id,
      purchaseid: session.transaction.purchaseid,
    },
  }); // add idempotent key also
  const query = {
    _id: session._id,
  };
  const options = {
    $set: {
      "transaction.paymentintentid": paymentIntent.id,
    },
  };
  await sessions.updateOne(query, options);
  const returnData = {
    publishableKey: stripePublishableKey,
    clientSecret: paymentIntent.client_secret,
  };
  return returnData;
};

module.exports = {
  dataForPaymentPage,
  addTemporaryProductInUserForPaymentPage,
  getDefaultAddress,
  calculateOrderAmount,
  placeOrder,
  createPaymentIntent,
};
