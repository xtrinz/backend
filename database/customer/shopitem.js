const { shops, products } = require("../connect");
const { Api404Error } = require("../../error/errorclass/errorclass");
const { isArrayEmpty, isObjectEmpty } = require("../../common/utils");

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
  if (isObjectEmpty(shopinfo)) {
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
  const product1 = await products.findOne(query1);
  const query2 = {
    _id: shopinfoid,
  };
  const options2 = {
    $projection: {
      shopname: 1,
    },
  };
  const shopinfo = await shops.findOne(query2, options2);
  if (isObjectEmpty(shopinfo) || isObjectEmpty(product1)) {
    throw new Api404Error("Not found", "Not found");
  }
  const returnData = {
    shopId: shopinfo._id,
    shopName: shopinfo.shopname,
    productid: product1._id,
    productName: product1.productname,
    productvariations: product1.productvariations,
    producttype: product1.producttype,
    gstcategory: product1.gstcategory,
    warrentycard: product1.warrentycard,
    extradiscount: product1.extradiscount,
    productdescription: product1.productdescription,
    productdetails: product1.productdetails,
  };
  return returnData;
};

module.exports = {
  dataForShopItemPage,
  dataForItemDescriptionPage,
};
