const { ObjectId, ObjectID } = require("mongodb");
const {
  userCollection,
  shopInfoCollection,
  productsCollection,
  cartCollection,
} = require("../databaseconnections/mongoconnection");
const { Api403Error } = require("../error/errorclass/errorclass");
const { isArrayEmpty } = require("../functions");

// data for payment page
const dataForPaymentPage = async function (user) {
  let data = [];
  let totalPrice = 0;
  // get detatiled info regarding product from shop info and products
  if (isArrayEmpty(user.temporaryproducts)) {
    throw new Api403Error("Forbidden", "Please checkout your cart");
  }
  for (let product of user.temporaryproducts) {
    const query1 = {
      _id: ObjectId(product.shopinfoid),
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
        _id: ObjectId(user._id),
      };
      const options3 = {
        $pull: {
          temporaryproducts: {
            _id: ObjectId(product._id),
          },
        },
      };
      await userCollection.updateOne(query3, options3);
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
  const query3 = {
    _id: ObjectId(user._id),
  };
  const options3 = {
    $set: {
      temporaryproducts: temporaryData,
    },
  };
  // update product into user collection
  await userCollection.updateOne(query3, options3);
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
  user,
  customername,
  phonenumber,
  addressid
) {
  const query = {
    _id: ObjectId(user._id),
  };
  const options = {
    $set: {
      tempdeldetails: {
        customername,
        phonenumber,
        addressid,
      },
    },
  };
  await userCollection.updateOne(query, options);
};

module.exports = {
  dataForPaymentPage,
  addTemporaryProductInUserForPaymentPage,
  getDefaultAddress,
  tempStoreDelDetails,
};
