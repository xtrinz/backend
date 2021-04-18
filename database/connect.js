// mongo  client to create connection between node and mongodb
const { MongoClient } = require("mongodb");

// mongodb database
const url = "mongodb://localhost:27017";
const dbName = "database";
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect().catch(e => console.log(e));
const database = client.db(dbName);
const shopInfoCollection = database.collection("shopinfo");
const userCollection = database.collection("user");
const cartCollection = database.collection("cart");
const productsCollection = database.collection("products");
const purchaseHistoryCollection = database.collection("purchasehistory");
const temporaryUserCollection = database.collection("temporaryuser");
const sessionCollection = database.collection("session");
const tempShopInfoCollection = database.collection("tempshopinfo");
const shopOrderHistoryCollection = database.collection("shoporderhistory");

module.exports = {
  client,
  database,
  shopInfoCollection,
  userCollection,
  cartCollection,
  productsCollection,
  purchaseHistoryCollection,
  temporaryUserCollection,
  sessionCollection,
  tempShopInfoCollection,
  shopOrderHistoryCollection,
};
