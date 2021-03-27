const { ObjectId } = require("mongodb");
const {
  productsCollection,
  shopInfoCollection,
} = require("../databaseconnections/mongoconnection");

const dataForShopItemPage = async function (shopid) {
  const query1 = {
    _id: ObjectId(shopid),
  };
  const options1 = {
    projection: {
      _id: 1,
      products: 1,
      shopname: 1,
    },
  };
  const shopinfo = await shopInfoCollection.findOne(query1, options1);
  const data = [];
  for (const product of shopinfo.products) {
    const query2 = {
      _id: ObjectId(product.productid),
    };
    const options2 = {
      projection: {
        _id: 1,
        productname: 1,
        productimage: 1,
      },
    };
    const products = await productsCollection.findOne(query2, options2);
    const arrayData = {
      price: product.price,
      productid: products._id,
      productName: products.productname,
      productImage: products.productimage,
    };
    data.push(arrayData);
  }
  const returnData = {
    data,
    shopId: shopinfo._id,
    shopName: shopinfo.shopname,
  };
  return returnData;
};

const dataForItemDescriptionPage = async function (shopid, itemid) {
  const query1 = {
    _id: ObjectId(itemid),
  };
  const options1 = {
    projection: {
      _id: 1,
      productname: 1,
      productimage: 1,
    },
  };
  const products = await productsCollection.findOne(query1, options1);
  const query2 = {
    _id: ObjectId(shopid),
  };
  const options2 = {
    projection: {
      _id: 1,
      products: { $elemMatch: { productid: ObjectId(itemid) } },
      shopname: 1,
    },
  };
  const shopinfo = await shopInfoCollection.findOne(query2, options2);
  const returnData = {
    shopId: shopinfo._id,
    shopName: shopinfo.shopname,
    productid: products._id,
    productName: products.productname,
    productImage: products.productimage,
    price: shopinfo.products[0].price,
  };
  return returnData;
};

module.exports.dataForShopItemPage = dataForShopItemPage;
module.exports.dataForItemDescriptionPage = dataForItemDescriptionPage;
