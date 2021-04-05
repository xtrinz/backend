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
const dataForCartPage = async function (user) {
  // collect info regarding that cartid from cart collection
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
    // bychance if cart collection deleted or cart id become invalid
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
  }

  // cart collection contain only ids . to populate info regarding ids we need more database queries and because that
  // codes also used for some other routes that codes wraped in a function.

  let data = [];
  if (cart.products) {
    for (let product of cart.products) {
      const query3 = {
        _id: ObjectId(product.shopinfoid),
        products: { $elemMatch: { productid: ObjectId(product.productsid) } },
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
      if (!shopinfo || !products) {
        // if any of the one doesn't exist then we should delete refence to that from cart
        const query5 = {
          _id: ObjectId(cart._id),
        };
        const options5 = {
          $pull: {
            products: {
              _id: ObjectId(product._id),
            },
          },
        };
        await cartCollection.updateOne(query5, options5);
        continue;
      } // Todo : if stock of the product is false . then we should do something
      const arrayData = {
        shopId: shopinfo._id,
        shopName: shopinfo.shopname,
        price: shopinfo.products[0].price,
        productId: products._id,
        productName: products.productname,
        productImage: products.productimage,
        quantity: product.quantity,
        stockStatus: shopinfo.products[0].stockstatus,
        cartItemId: product._id,
      };
      data.push(arrayData);
    }
  }
  return data;
};

const addItemToCart = async function (user, shopinfoid, productsid, quantity) {
  // updating cart collection with incoming data
  // refer mongo db doc for more info
  const query1 = {
    _id: ObjectId(user.cartid),
  };
  const options1 = {
    $push: {
      products: {
        _id: new ObjectID(),
        shopinfoid: ObjectId(shopinfoid),
        productsid: ObjectId(productsid),
        quantity: quantity,
      },
    },
  };
  let cart = await cartCollection.updateOne(query1, options1);

  // bychance if cart collection deleted or cart id become invalid : worst case scenarios like if admin want
  //to delete cart collection or something like that
  if (cart.modifiedCount == 0) {
    cart = await cartCollection.findOne(query1);
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
      const query3 = {
        _id: ObjectId(cart.insertedId),
      };
      await cartCollection.updateOne(query3, options1);
    }
  }
};

const deleteCartItem = async function (user, cartitemid) {
  // deleting that item from cart
  const query1 = {
    _id: ObjectId(user.cartid),
  };
  const options1 = {
    $pull: {
      products: {
        _id: ObjectId(cartitemid),
      },
    },
  };
  await cartCollection.updateOne(query1, options1);
};

module.exports = {
  dataForCartPage,
  addItemToCart,
  deleteCartItem,
};
