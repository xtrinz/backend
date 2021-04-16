const { ObjectId } = require("mongodb");
const {
  productsCollection,
  shopInfoCollection,
} = require("./connect");
const { Api404Error } = require("../error/errorclass/errorclass");
const { isArrayEmpty } = require("../common/utils");

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
  if (!shopinfo) {
    throw new Api404Error("Not Found", "Not Found");
  }
  if (isArrayEmpty(shopinfo.products)) {
    throw new Api404Error("Not Found", "Not Found");
  }
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
    const products1 = await productsCollection.findOne(query2, options2);
    if (!products1) {
      continue;
    }
    const arrayData = {
      price: product.price,
      productid: products1._id,
      productName: products1.productname,
      productImage: products1.productimage,
    };
    data.push(arrayData);
  }
  if (isArrayEmpty(data)) {
    throw new Api404Error("Not Found", "Not Found");
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
    products: { $elemMatch: { productid: ObjectId(itemid) } },
  };
  const options2 = {
    projection: {
      _id: 1,
      products: { $elemMatch: { productid: ObjectId(itemid) } },
      shopname: 1,
    },
  };
  const shopinfo = await shopInfoCollection.findOne(query2, options2);
  if (!shopinfo || !products) {
    throw new Api404Error("Not found", "Not found");
  }
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

module.exports = {
  dataForShopItemPage,
  dataForItemDescriptionPage,
};
