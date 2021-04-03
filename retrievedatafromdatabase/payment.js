require("dotenv").config();
const { ObjectId, ObjectID } = require("mongodb");
const {
  userCollection,
  shopInfoCollection,
  productsCollection,
  cartCollection,
  sessionCollection,
} = require("../databaseconnections/mongoconnection");
const { Api403Error, Api404Error } = require("../error/errorclass/errorclass");
const { isArrayEmpty, isObjectEmpty } = require("../functions");
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
      _id: ObjectId(product.shopinfoid),
      products: { $elemMatch: { productid: ObjectId(product.productsid) } },
    };
    const options1 = {
      projection: {
        products: { $elemMatch: { productid: ObjectId(product.productsid) } },
        _id: 1,
        shopname: 1,
      },
    };
    const shopinfo = await shopInfoCollection.findOne(query1, options1);
    const query2 = {
      _id: ObjectId(product.productsid),
    };
    const options2 = {
      projection: {
        _id: 1,
        productname: 1,
        productimage: 1,
      },
    };
    const products = await productsCollection.findOne(query2, options2);
    if (!shopinfo || !products) {
      const query3 = {
        _id: ObjectId(session._id),
      };
      const options3 = {
        $pull: {
          "transaction.$.temporaryproducts": {
            _id: ObjectId(product._id),
          },
        },
      };
      await sessionCollection.updateOne(query3, options3);
      continue;
    }
    const arrayData = {
      shopId: shopinfo._id,
      shopName: shopinfo.shopname,
      productid: products._id,
      productName: products.productname,
      productImage: products.productimage,
      price: shopinfo.products[0].price,
      quantity: product.quantity,
    };
    data.push(arrayData);
  }
  if (isArrayEmpty(data)) {
    throw new Api404Error(
      "Not found",
      "Something went wrong. Please try again"
    );
  }
  // calculate total price
  for (const { price, quantity } of data) {
    totalPrice = totalPrice + price * quantity;
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
  productsid
) {
  let temporaryData = [];
  if (isRequestFromCart) {
    const query1 = {
      _id: ObjectId(user.cartid),
    };
    const options1 = {
      projection: {
        products: 1,
      },
    };
    let cart = await cartCollection.findOne(query1, options1);
    if (!cart) {
      const insertOptions = {
        products: [],
      };
      cart = await cartCollection.insertOne(insertOptions);
      const query2 = {
        _id: ObjectId(user._id),
      };
      const options2 = {
        $set: {
          cartid: ObjectId(cart.insertedId),
        },
      };
      await userCollection.updateOne(query2, options2);
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
      shopinfoid: ObjectId(shopinfoid),
      productsid: ObjectId(productsid),
      quantity,
    };
    temporaryData.push(arrayData);
  }
  const insertOptions = {
    userid: ObjectId(user._id),
    transaction: {
      temporaryproducts: temporaryData,
    },
  };
  const session = await sessionCollection.insertOne(insertOptions);
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
      if (compareTwo(user.lastdeladdressid, address._id)) {
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

const tempStoreDelDetails = async function (
  session,
  customername,
  phonenumber,
  addressid
) {
  const query = {
    _id: ObjectId(session._id),
  };
  const options = {
    $set: {
      "transaction.tempdeldetails": {
        customername,
        phonenumber,
        addressid,
      },
    },
  };
  await sessionCollection.updateOne(query, options);
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
    const query1 = {
      _id: ObjectId(product.shopinfoid),
      products: { $elemMatch: { productid: ObjectId(product.productsid) } },
    };
    const options1 = {
      projection: {
        products: { $elemMatch: { productid: ObjectId(product.productsid) } },
        _id: 1,
        shopname: 1,
      },
    };
    const shopinfo = await shopInfoCollection.findOne(query1, options1);
    const query2 = {
      _id: ObjectId(product.productsid),
    };
    const options2 = {
      projection: {
        _id: 1,
        productname: 1,
        productimage: 1,
      },
    };
    const products = await productsCollection.findOne(query2, options2);
    if (!shopinfo || !products) {
      const query3 = {
        _id: ObjectId(session._id),
      };
      const options3 = {
        $pull: {
          "transaction.$.temporaryproducts": {
            _id: ObjectId(product._id),
          },
        },
      };
      await sessionCollection.updateOne(query3, options3);
      continue;
    }
    cartValue = cartValue + shopinfo.products[0].price;
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
  if (
    isObjectEmpty(session.transaction) ||
    isArrayEmpty(session.transaction.temporaryproducts)
  ) {
    throw new Api403Error("Forbidden", "Please checkout your cart");
  }
  const temporaryproducts = session.transaction.temporaryproducts;
  for (let product of temporaryproducts) {
    const query1 = {
      _id: ObjectId(product.shopinfoid),
      products: { $elemMatch: { productid: ObjectId(product.productsid) } },
    };
    const options1 = {
      projection: {
        products: { $elemMatch: { productid: ObjectId(product.productsid) } },
        _id: 1,
        shopname: 1,
      },
    };
    const shopinfo = await shopInfoCollection.findOne(query1, options1);
    const query2 = {
      _id: ObjectId(product.productsid),
    };
    const options2 = {
      projection: {
        _id: 1,
        productname: 1,
        productimage: 1,
      },
    };
    const products = await productsCollection.findOne(query2, options2);
    if (!shopinfo || !products) {
      const query3 = {
        _id: ObjectId(session._id),
      };
      const options3 = {
        $pull: {
          "transaction.$.temporaryproducts": {
            _id: ObjectId(product._id),
          },
        },
      };
      await sessionCollection.updateOne(query3, options3);
      continue;
    } // Todo : stock status should be consider
    const arrayData = {
      shopinfoid: ObjectId(shopinfo._id),
      shopname: shopinfo.shopname,
      producstid: ObjectId(products._id),
      productsname: products.productname,
      productsimage: products.productimage,
      price: shopinfo.products[0].price,
      quantity: product.quantity,
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
    paymentstatus: "pending",
  };
  // update all the info regarding the purchase into purchase history collection
  const insertedData = await purchaseHistoryCollection.insertOne(insertData);
  const purchaseid = insertedData.insertedId;
  const query4 = {
    _id: ObjectId(user._id),
  };
  const options4 = {
    $push: {
      purchaseid: purchaseid,
    },
  };
  // retrieve the purchase id of that purchase and store that in user collection
  await userCollection.updateOne(query4, options4);
  const query5 = {
    _id: ObjectId(session._id),
  };
  const options5 = {
    $set: {
      "transaction.purchaseid": purchaseid,
    },
  };
  await sessionCollection.updateOne(query5, options5);
};

const createPaymentIntent = async function (user, session, charges) {
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
    _id: ObjectId(session._id),
  };
  const options = {
    $set: {
      "transaction.paymentintentid": paymentIntent.id,
    },
  };
  await sessionCollection.updateOne(query, options);
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
  tempStoreDelDetails,
  calculateOrderAmount,
  placeOrder,
  createPaymentIntent,
};
