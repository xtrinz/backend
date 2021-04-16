const { ObjectId } = require("mongodb");
const { shopInfoCollection, productsCollection } = require("../connect");

const dataForSearchResultPage = async function (searchresult) {
  // if search type is shop then query in shop info
  const query1 = {
    enum: searchresult,
  };
  const options1 = {
    _id: 1,
    shopname: 1,
    shopimage: 1,
    location: 1,
  };
  const shopinfo1 = await shopInfoCollection.find(query1).project(options1);
  let shopData = await shopinfo1.toArray();

  // or query in products collection
  const query2 = {
    enum: searchresult,
  };
  const options2 = {
    _id: 1,
    productname: 1,
    productimage: 1,
  };
  let productData = [];
  const products = await productsCollection.find(query2).project(options2);
  // it is a special for loop to loop through cursor
  /**
   * query all the shops where this item currenlty selling
   * then shop info and price of that item in that specific shop
   */
  for await (const product of products) {
    for (const shopinfoid of product.shopinfoid) {
      const query3 = {
        _id: ObjectId(shopinfoid),
      };
      const options3 = {
        products: { $elemMatch: { productid: ObjectId(product._id) } },
        _id: 1,
        shopname: 1,
      };
      const shopinfo2 = await shopInfoCollection.findOne(query3, options3);
      if (!shopinfo2) {
        continue; // throwing error or removing shopinfo id from product is inapproppriate(because this api is requested by customer)
      }
      const arrayData1 = {
        shopId: shopinfo2._id,
        shopName: shopinfo2.shopname,
        productid: product._id,
        productName: product.productname,
        productImage: product.productimage,
        price: shopinfo2.products[0].price,
      };
      productData.push(arrayData1);
    }
  }
  const returnData = {
    shopData,
    productData,
  };
  return returnData;
};

module.exports = { dataForSearchResultPage };
