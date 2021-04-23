const { users, carts, shops, products } = require("../connect");
const { ObjectID } = require("mongodb");

/**
 *
 * @param {id of the user} userid
 * this function return the cart data
 */
const dataForCartPage = async function (user) {
  // collect info regarding that cartid from cart collection
  const query1 = {
    _id: user.cartid,
  };
  const options1 = {
    projection: {
      products: 1,
    },
  };
  let cart = await carts.findOne(query1, options1);
  if (!cart) {
    // bychance if cart collection deleted or cart id become invalid
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
  }

  // cart collection contain only ids . to populate info regarding ids we need more database queries and because that
  // codes also used for some other routes that codes wraped in a function.

  let data = [];
  if (cart.products) {
    for (let product of cart.products) {
      const query3 = {
        _id: product.shopinfoid,
      };
      const options3 = {
        projection: {
          _id: 1,
          shopname: 1,
        },
      };
      const shopinfo = await shops.findOne(query3, options3);
      const query4 = {
        _id: product.productsid,
        shopinfoid: product.shopinfoid,
        "productvariations.uniqueid": uniqueid,
      };
      const products = await products.findOne(query4);
      if (!shopinfo || !products) {
        // if any of the one doesn't exist then we should delete refence to that from cart
        const query5 = {
          _id: cart._id,
        };
        const options5 = {
          $pull: {
            products: {
              _id: product._id,
            },
          },
        };
        await carts.updateOne(query5, options5);
        continue;
      } // Todo : if stock of the product is false . then we should do something
      let quantity, productcolor, productimage, variationtype, productprice;
      const variation = products.productvariations;
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
        shopid: shopinfo._id,
        shopname: shopinfo.shopname,
        productid: products._id,
        productname: products.productname,
        productimage,
        productprice,
        variation,
        uniqueId: product.uniqueid,
        quantity: product.quantity,
        cartItemId: product._id,
      };
      if (variationtype.indexOf("color")) {
        arrayData = { ...arrayData, productcolor, variationtype };
      }
      data.push(arrayData);
    }
  }
  return data;
};

const addItemToCart = async function (
  user,
  shopinfoid,
  productsid,
  uniqueid,
  quantity
) {
  // updating cart collection with incoming data
  // refer mongo db doc for more info
  const query1 = {
    _id: user.cartid,
  };
  const options1 = {
    $push: {
      products: {
        _id: new ObjectID(),
        shopinfoid,
        productsid,
        uniqueid,
        quantity,
      },
    },
  };
  let cart = await carts.updateOne(query1, options1);

  // bychance if cart collection deleted or cart id become invalid : worst case scenarios like if admin want
  //to delete cart collection or something like that
  if (cart.modifiedCount == 0) {
    cart = await carts.findOne(query1);
    if (!cart) {
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
      const query3 = {
        _id: cart.insertedId,
      };
      await carts.updateOne(query3, options1);
    }
  }
};

const deleteCartItem = async function (user, cartitemid) {
  // deleting that item from cart
  const query1 = {
    _id: user.cartid,
  };
  const options1 = {
    $pull: {
      products: {
        _id: cartitemid,
      },
    },
  };
  await carts.updateOne(query1, options1);
};

module.exports = {
  dataForCartPage,
  addItemToCart,
  deleteCartItem,
};
