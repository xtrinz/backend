const { shops, products } = require("../connect");
const { Api404Error } = require("../../error/errorclass/errorclass");
const { isArrayEmpty } = require("../../common/utils");

const dataForShopItemPage = async function (shopinfoid) {
  const query1 = {
    _id: shopinfoid,
  };
  const options1 = {
    projection: {
      _id: 1,
      products: 1,
      shopname: 1,
    },
  };
  const shopinfo = await shops.findOne(query1, options1);
  if (!shopinfo) {
    throw new Api404Error("Not Found", "Not Found");
  }
  if (isArrayEmpty(shopinfo.products)) {
    throw new Api404Error("Not Found", "Not Found");
  }
  const query2 = {
    _id: {
      $in: shopinfo.products,
    },
  };
  let product = await products.find(query2);
  for await (const item of product) {
    const arrayData = {
      productname: item.productname,
      productvariations: item.productvariations,
      producttype: item.producttype,
      gstcategory: item.gstcategory,
      extradiscount: item.extradiscount,
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

const dataForItemDescriptionPage = async function (shopinfoid, productid) {
  const query1 = {
    _id: productid,
  };
  const products = await products.findOne(query1);
  const query2 = {
    _id: shopinfoid,
  };
  const options2 = {
    $projection: {
      shopname: 1,
    },
  };
  const shopinfo = await shops.findOne(query2, options2);
  if (!shopinfo || !products) {
    throw new Api404Error("Not found", "Not found");
  }
  const returnData = {
    shopId: shopinfo._id,
    shopName: shopinfo.shopname,
    productid: products._id,
    productName: products.productname,
    productvariations: products.productvariations,
    producttype: products.producttype,
    gstcategory: products.gstcategory,
    warrentycard: products.warrentycard,
    extradiscount: products.extradiscount,
    productdescription: products.productdescription,
    productdetails: products.productdetails,
  };
  return returnData;
};

module.exports = {
  dataForShopItemPage,
  dataForItemDescriptionPage,
};
