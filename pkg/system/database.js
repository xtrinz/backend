const { MongoClient } = require('mongodb')
const { set }         = require('../system/models')
const client          = new MongoClient(process.env.DB_URL,
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

    , users 	  = database.collection(set.user)
    , sockets 	= database.collection(set.socket)
    , stores 	  = database.collection(set.store)
    , products 	= database.collection(set.product)
    , carts 	  = database.collection(set.cart)
    , journals 	= database.collection(set.journal)
    , transits 	= database.collection(set.transit)
    , channels 	= database.collection(set.channel)
    , tags    	= database.collection(set.tags)        

    stores.createIndex({ Location: '2dsphere' })
     users.createIndex({ Location: '2dsphere' })
    stores.createIndex({ Name: "text", Description: "text" } )

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
  , channels
  , tags
}