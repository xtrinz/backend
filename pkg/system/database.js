const { set }         = require('../system/models')
    , Log             = require('./log')
    , { MongoClient } = require('mongodb')

var _db = {}

const Connect = async function ()
{
  let _p = new Promise((resolve, reject) =>
  {
    let opt = { useNewUrlParser: true, useUnifiedTopology: true }
    MongoClient.connect(process.env.DB_URL + '/' + process.env.DB_NAME, opt, async (err, cli) =>
    {
      if (err)
      {
        Log('Error connecting to database', { Err : err })
        reject(err)
      }
      else
      {
        await SetDB(cli)
        Log('Connected to database', { DB_URL : process.env.DB_URL })
        resolve()
      }
    })
  })
  await _p
}

async function SetDB (client)
{
  Log('Setting database', { DB_URL : process.env.DB_URL })
  _db.client    = client
  _db.database  = await client.db(process.env.DB_NAME)
  _db.notes 	  = await _db.database.collection(set.note)
  _db.users 	  = await _db.database.collection(set.user)
  _db.agents 	  = await _db.database.collection(set.agent)
  _db.admins 	  = await _db.database.collection(set.admin)    
  _db.sockets 	= await _db.database.collection(set.socket)
  _db.stores 	  = await _db.database.collection(set.store)
  _db.products 	= await _db.database.collection(set.product)
  _db.carts 	  = await _db.database.collection(set.cart)
  _db.journals 	= await _db.database.collection(set.journal)
  _db.transits 	= await _db.database.collection(set.transit)
  _db.channels 	= await _db.database.collection(set.channel)
  _db.tags    	= await _db.database.collection(set.tags)

  Log('Database set', { DB_URL : process.env.DB_URL })

  Log('Setting indexes', { DB_URL : process.env.DB_URL })

  await    _db.stores.createIndex({ 'Address.Location': '2dsphere' })
  await     _db.users.createIndex({ Location: '2dsphere' })
  await    _db.agents.createIndex({ Location: '2dsphere' })     
  await  _db.products.createIndex({ Location: '2dsphere' })
  await    _db.stores.createIndex({ Name: "text", Description: "text" })
  await  _db.products.createIndex({ Name: "text", Description: "text", Category: 'text' })
  await     _db.notes.createIndex({ Type: "text" })

  Log('Indexes set', { DB_URL : process.env.DB_URL })
}

function db()    { return _db  }

module.exports = { Connect, db }