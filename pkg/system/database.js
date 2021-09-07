const { MongoClient } = require('mongodb')
const client    = new MongoClient(process.env.DB_URL,
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

client.connect()
      .then(result => console.log('db-connected', { URL  : result.s.url }))
      .catch(err => 
      {
        console.log('db-connection-failed', {Error: err})
        process.exit(1)
      })

const database  = client.db(process.env.DB_NAME)

    , users 	  = database.collection('user')
    , sockets 	= database.collection('socket')
    , stores 	  = database.collection('store')
    , products 	= database.collection('product')
    , carts 	  = database.collection('cart')
    , journals 	= database.collection('journal')
    , transits 	= database.collection('transit')

    stores.createIndex({ Location: '2dsphere' })
     users.createIndex({ Location: '2dsphere' })

module.exports  =
{
    client
  , database

  , users
  , sockets
  , stores
  , products
  , carts
  , journals
  , transits
}