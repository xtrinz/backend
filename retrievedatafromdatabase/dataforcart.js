const {
  userCollection,
  cartCollection,
  shopInfoCollection,
  productsCollection,
} = require("../databaseconnections/mongoconnection");
const { ObjectId, ObjectID } = require("mongodb");

/**
 *
 * @param {id of the user} userid
 * this function return the cart data
 */
const dataForCartPage = async function (userid) {
  // cartid for a specific user stored in user collection. retrieve that cartid
  const query1 = {
    _id: ObjectId(userid),
  };
  const options1 = {
    projection: {
      cartid: 1,
    },
  };
  const user = await userCollection.findOne(query1, options1);
  // collect info regarding that cartid from cart collection
  const query2 = {
    _id: ObjectId(user.cartid),
  };
  const options2 = {
    projection: {
      products: 1,
    },
  };
  const cart = await cartCollection.findOne(query2, options2);
  // cart collection contain only ids . to populate info regarding ids we need more database queries and because that
  // codes also used for some other routes that codes wraped in a function.
  let data = [];
  for (let product of cart.products) {
    const query3 = {
      _id: ObjectId(product.shopinfoid),
    };
    const options3 = {
      projection: {
        products: { $elemMatch: { productid: ObjectId(product.productsid) } },
        _id: 1,
        shopname: 1,
      },
    };
    const shopinfo = await shopInfoCollection.findOne(query3, options3);
    const query4 = {
      _id: ObjectId(product.productsid),
    };
    const options4 = {
      projection: {
        _id: 1,
        productname: 1,
        productimage: 1,
      },
    };
    const products = await productsCollection.findOne(query4, options4);
    const arrayData = {
      shopId: shopinfo._id,
      shopName: shopinfo.shopname,
      price: shopinfo.products[0].price,
      productid: products._id,
      productName: products.productname,
      productImage: products.productimage,
      quantity: product.quantity,
      cartItemId: product._id,
    };
    data.push(arrayData);
  }
  return data;
};

const addItemToCart = async function (
  userid,
  shopinfoid,
  productsid,
  quantity
) {
  const query1 = {
    _id: ObjectId(userid),
  };
  const options1 = {
    projection: {
      cartid: 1,
    },
  };
  const user = await userCollection.findOne(query1, options1);
  // updating cart collection with incoming data
  // refer mongo db doc for more info
  const query2 = {
    _id: ObjectId(user.cartid),
  };
  const options2 = {
    $push: {
      products: {
        _id: new ObjectID(),
        shopinfoid: ObjectId(shopinfoid),
        productsid: ObjectId(productsid),
        quantity: quantity,
      },
    },
  };
  await cartCollection.updateOne(query2, options2);
};

const deleteCartItem = async function (userid, cartitemid) {
  // deleting that item from cart
  const query1 = {
    _id: ObjectId(userid),
  };
  const options1 = {
    projection: {
      cartid: 1,
    },
  };
  const user = await userCollection.findOne(query1, options1);
  const query2 = {
    _id: ObjectId(user.cartid),
  };
  const options2 = {
    $pull: {
      products: {
        _id: ObjectId(cartitemid),
      },
    },
  };
  await cartCollection.updateOne(query2, options2);
};

module.exports.dataForCartPage = dataForCartPage;
module.exports.addItemToCart = addItemToCart;
module.exports.deleteCartItem = deleteCartItem;
