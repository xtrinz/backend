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

    , notes 	  = database.collection(set.note)
    , users 	  = database.collection(set.user)
    , agents 	  = database.collection(set.agent)
    , admins 	  = database.collection(set.admin)    
    , sockets 	= database.collection(set.socket)
    , stores 	  = database.collection(set.store)
    , products 	= database.collection(set.product)
    , carts 	  = database.collection(set.cart)
    , journals 	= database.collection(set.journal)
    , transits 	= database.collection(set.transit)
    , channels 	= database.collection(set.channel)
    , tags    	= database.collection(set.tags)        

    stores.createIndex({ 'Address.Location': '2dsphere' })
     users.createIndex({ Location: '2dsphere' })
    agents.createIndex({ Location: '2dsphere' })     
  products.createIndex({ Location: '2dsphere' })
    stores.createIndex({ Name: "text", Description: "text" })
  products.createIndex({ Name: "text", Description: "text", Category: 'text' })
     notes.createIndex({ Type: "text" })

module.exports  =
{
    client
  , database

  , users
  , agents
  , admins
  , sockets
  , stores
  , products
  , carts
  , journals
  , transits
  , channels
  , tags
  , notes
}