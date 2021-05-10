const { MongoClient } = require("mongodb")
const client    = new MongoClient(process.env.DB_URL,
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
client.connect()
      .then(result => console.log(`DB-connected. res: ${result} URL: ${process.env.DB_URL}`))
      .catch(e => console.log(e))
const database  = client.db(process.env.DB_NAME)
const users 	  = database.collection("user")
const sockets 	= database.collection("socket")
const stores 	  = database.collection("store")
const products 	= database.collection("products")
const carts 	  = database.collection("cart")
const journals 	= database.collection("journal")
const transits 	= database.collection("transit")

const shops 	  = database.collection("shopinfo")

module.exports  =
{
  client,
  users,
  sockets,
  stores,
  products,
  carts,
  journals,
  transits,

  shops
}