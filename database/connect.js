const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

client.connect()
      .then(result => console.log(`DB-connected. URL: ${process.env.DB_URL}`))
      .catch(e => console.log(e))

const database = client.db(process.env.DB_NAME)

const shops 	= database.collection("shopinfo")
const stores 	= database.collection("store")
const users 	= database.collection("user")
const carts 	= database.collection("cart")
const products 	= database.collection("products")
const purchases = database.collection("purchasehistory")
const tempUsers = database.collection("temporaryuser")
const sessions 	= database.collection("session")
const tempShops = database.collection("tempshopinfo")
const orders 	= database.collection("shoporderhistory")
const sockets 	= database.collection("socket")
const transits 	= database.collection("transit")

module.exports = {
  client,
  database,
  shops,
  stores,
  users,
  carts,
  products,
  purchases,
  tempUsers,
  sessions,
  tempShops,
  orders,
  sockets,
  transits
};
