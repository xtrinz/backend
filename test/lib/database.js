const { set }         = require('../../pkg/sys/models')
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
        console.log('Error connecting to database', { Err : err })
        reject(err)
      }
      else
      {
        await SetDB(cli)
        resolve()
      }
    })
  })
  await _p
}

async function SetDB (client)
{

  _db.client    = client
  _db.database  = await client.db(process.env.DB_NAME)
  _db.notes 	  = await _db.database.collection(set.note)
  _db.clients 	= await _db.database.collection(set.client)
  _db.agents 	  = await _db.database.collection(set.agent)
  _db.arbiters 	= await _db.database.collection(set.arbiter)
  _db.sellers 	= await _db.database.collection(set.seller)
  _db.products 	= await _db.database.collection(set.product)
  _db.carts 	  = await _db.database.collection(set.cart)
  _db.journals 	= await _db.database.collection(set.journal)
  _db.transits 	= await _db.database.collection(set.transit)
  _db.channels 	= await _db.database.collection(set.channel)
  _db.tags    	= await _db.database.collection(set.tags)
  _db.ledgers   = await _db.database.collection(set.ledger)
  _db.addresses = await _db.database.collection(set.address)    


  await   _db.sellers.createIndex({ 'Address.Location': '2dsphere' })
  await   _db.clients.createIndex({ Location: '2dsphere' })
  await    _db.agents.createIndex({ Location: '2dsphere' })     
  await  _db.arbiters.createIndex({ Location: '2dsphere' })       
  await  _db.products.createIndex({ Location: '2dsphere' })
  await   _db.sellers.createIndex({ Name: "text", Description: "text" })
  await  _db.products.createIndex({ Name: "text", Description: "text", Category: 'text' })
  await     _db.notes.createIndex({ Type: "text" })

}

function db()    { return _db  }

module.exports = { Connect, db, SetDB }