
const engine   = require('../../engine/engine')
    , Model    = require('../../system/models')
    , db       = require('../exports')[Model.segment.db]

class Transit
{
    constructor(journal)
    {
      this._id 		   = ''
      this.JournalID = journal._id
      this.Store 		 =
      {               
          _id        : journal.Seller.ID
        , SockID     : []
        , Name       : journal.Seller.Name
        , MobileNo   : journal.Seller.MobileNo
        , Address    : journal.Seller.Address
      }               
      this.User 		 =
      {               
          _id        : journal.Buyer.ID
        , SockID     : []
        , Name       : journal.Buyer.Name
        , MobileNo   : journal.Buyer.MobileNo
        , Address    : journal.Buyer.Address
      }               
      this.Agent     =
      {               
          _id        : ''
        , SockID     : []
        , Name       : ''         
        , MobileNo   : ''
      }               
      this.Admin     =
      {               
          _id        : ''
        , SockID     : []
        , Name       : ''         
        , MobileNo   : ''
      }               
      this.History   = []
      this.Return 	 = ''
      this.State 		 = Model.states.None
      this.IsLive    = true
      this.Event 		 = Model.event.Init
      this.OrderedAt = ''
    }

    async Init(_id)
    {

        this.User.SockID  = await db.user.GetUserSockID(this.User._id)
        this.Store.SockID = await db.store.GetStoreSockID(this.Store._id)
        this._id          = _id
        this.OrderedAt    = (new Date()).toISOString()

        await engine.Transition(this)
        console.log('transit-initialised', { Data: this })
    }

}

module.exports = Transit