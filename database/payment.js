require("dotenv").config();
const { ObjectId, ObjectID } = require("mongodb");
const {
  userCollection,
  shopInfoCollection,
  productsCollection,
  cartCollection,
  sessionCollection,
} = require("./connect");
const { Api403Error, Api404Error } = require("../error/errorclass/errorclass");
const { isArrayEmpty, isObjectEmpty } = require("../common/utils");
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
    const shopinfo = await shopInfoCollection.findOne(query1, options1);
    const query2 = {
      $and: [
        {
          _id: product.productsid,
          shopinfoid: product.shopinfoid,
        },
        {
          $or: [
            {
              "productvariations.color.uniqueid": product.uniqueid,
            },
            {
              "productvariations.default.uniqueid": product.uniqueid,
            },
          ],
        },
      ],
    };
    const products = await productsCollection.findOne(query2);
    if (!shopinfo || !products) {
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
      await sessionCollection.updateOne(query3, options3);
      continue;
    }
    let productcolor, productprice, productimage, variation;
    if (products.productvariations.default) {
      productimage = products.productvariations.default.productimage;
      productcolor = products.productvariations.default.productcolor; // none
      productprice = products.productvariations.default.productprice;
      variation = "default";
    } else if (products.productvariations.color) {
      for (const varient of products.productvariations.color) {
        if (varient.uniqueid == product.uniqueid) {
          productimage = varient.productimage;
          productcolor = varient.productcolor;
          productprice = varient.productprice;
          variation = "color";
          break;
        }
      }
    }
    const arrayData = {
      shopId: shopinfo._id,
      shopName: shopinfo.shopname,
      productid: products._id,
      productName: products.productname,
      productImage: productimage,
      productColor: productcolor,
      productPrice: productprice,
      variation,
      uniqueId: product.uniqueid,
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
  for (const { productPrice, quantity } of data) {
    totalPrice = totalPrice + productPrice * quantity;
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
    let cart = await cartCollection.findOne(query1, options1);
    if (!cart) {
      const insertOptions = {
        products: [],
      };
      cart = await cartCollection.insertOne(insertOptions);
      const query2 = {
        _id: user._id,
      };
      const options2 = {
        $set: {
          cartid: cart.insertedId,
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
    const query2 = {
      $and: [
        {
          _id: product.productsid,
          shopinfoid: product.shopinfoid,
        },
        {
          $or: [
            {
              "productvariations.color.uniqueid": product.uniqueid,
            },
            {
              "productvariations.default.uniqueid": product.uniqueid,
            },
          ],
        },
      ],
    };
    const products = await productsCollection.findOne(query2);
    if (!products) {
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
      await sessionCollection.updateOne(query3, options3);
      continue;
    }
    let productprice;
    if (products.productvariations.default) {
      productprice = products.productvariations.default.productprice;
    } else if (products.productvariations.color) {
      for (const varient of products.productvariations.color) {
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
    };
    const options1 = {
      projection: {
        _id: 1,
        shopname: 1,
      },
    };
    const shopinfo = await shopInfoCollection.findOne(query1, options1);
    const query2 = {
      $and: [
        {
          _id: product.productsid,
          shopinfoid: product.shopinfoid,
        },
        {
          $or: [
            {
              "productvariations.color.uniqueid": product.uniqueid,
            },
            {
              "productvariations.default.uniqueid": product.uniqueid,
            },
          ],
        },
      ],
    };
    const products = await productsCollection.findOne(query2);
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
    let productcolor, productprice, productimage, variation;
    if (products.productvariations.default) {
      productimage = products.productvariations.default.productimage;
      productcolor = products.productvariations.default.productcolor; // none
      productprice = products.productvariations.default.productprice;
      variation = "default";
    } else if (products.productvariations.color) {
      for (const varient of products.productvariations.color) {
        if (varient.uniqueid == product.uniqueid) {
          productimage = varient.productimage;
          productcolor = varient.productcolor;
          productprice = varient.productprice;
          variation = "color";
          break;
        }
      }
    }
    const arrayData = {
      _id: new ObjectID(),
      shopinfoid: shopinfo._id,
      shopname: shopinfo.shopname,
      producstid: products._id,
      productsname: products.productname,
      productimage: productimage,
      productcolor: productcolor,
      productprice: productprice,
      variation,
      uniqueid: product.uniqueid,
      quantity: product.quantity,
    };
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
  for (const { productPrice, quantity } of productData) {
    totalPrice = totalPrice + productPrice * quantity;
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
  const insertedData = await purchaseHistoryCollection.insertOne(insertData);
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
  await userCollection.updateOne(query4, options4);
  const query5 = {
    _id: session._id,
  };
  const options5 = {
    $set: {
      "transaction.purchaseid": purchaseid,
    },
  };
  await sessionCollection.updateOne(query5, options5);
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
