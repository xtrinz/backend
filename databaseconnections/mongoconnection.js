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

module.exports.database = database;
module.exports.client = client;
module.exports.shopInfoCollection = database.collection("shopinfo");
module.exports.userCollection = database.collection("user");
module.exports.cartCollection = database.collection("cart");
module.exports.productsCollection = database.collection("products");
module.exports.purchaseHistoryCollection = database.collection(
  "purchasehistory"
);
module.exports.temporaryUserCollection = database.collection("temporaryuser");
