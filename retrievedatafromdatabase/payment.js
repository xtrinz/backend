const { ObjectId } = require("mongodb");
const {
  userCollection,
  shopInfoCollection,
  productsCollection,
  cartCollection,
} = require("../databaseconnections/mongoconnection");

// data for payment page
const dataForPaymentPage = async function (userid) {
  //take product details from user collection for payment page
  const query1 = {
    _id: ObjectId(userid),
  };
  const options1 = {
    projection: {
      temporaryproducts: 1,
      _id: 0,
      location: 1,
    },
  };
  const user = await userCollection.findOne(query1, options1);
  let data = [];
  let totalPrice = 0;
  // get detatiled info regarding product from shop info and products
  for (let product of user.temporaryproducts) {
    const query2 = {
      _id: ObjectId(product.shopinfoid),
    };
    const options2 = {
      projection: {
        products: { $elemMatch: { productid: ObjectId(product.productsid) } },
        _id: 1,
        shopname: 1,
      },
    };
    const shopinfo = await shopInfoCollection.findOne(query2, options2);
    const query3 = {
      _id: ObjectId(product.productsid),
    };
    const options3 = {
      projection: {
        _id: 1,
        productname: 1,
        productimage: 1,
      },
    };
    const products = await productsCollection.findOne(query3, options3);
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
  // calculate total price
  for (const { price, quantity } of data) {
    totalPrice = totalPrice + price * quantity;
  }
  const returnData = {
    data,
    totalPrice,
    location: user.location,
  };
  return returnData;
};

const addTemporaryProductInUserForPaymentPage = async function (
  userid,
  isRequestFromCart,
  quantity,
  shopinfoid,
  productsid
) {
  let temporaryData = [];
  if (isRequestFromCart) {
    const query1 = {
      _id: ObjectId(userid),
    };
    const options1 = {
      projection: {
        cartid: 1,
        _id: 0,
      },
    };
    const user = await userCollection.findOne(query1, options1);
    const query2 = {
      _id: ObjectId(user.cartid),
    };
    const options2 = {
      projection: {
        products: 1,
      },
    };
    const cart = await cartCollection.findOne(query2, options2);
    temporaryData = cart.products;
  } else {
    const arrayData = {
      shopinfoid: ObjectId(shopinfoid),
      productsid: ObjectId(productsid),
      quantity,
    };
    temporaryData.push(arrayData);
  }
  const query = {
    _id: ObjectId(userid),
  };
  const options = {
    $set: {
      temporaryproducts: temporaryData,
    },
  };
  // update product into user collection
  await userCollection.updateOne(query, options);
};

module.exports.dataForPaymentPage = dataForPaymentPage;
module.exports.addTemporaryProductInUserForPaymentPage = addTemporaryProductInUserForPaymentPage;
