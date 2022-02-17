
const engine   = require('../core/engine')
    , Model    = require('../../../sys/models')
    , Log      = require('../../../sys/log')

class Transit
{
    constructor(journal)
    {
      this._id 		   = ''
      this.JournalID = journal._id
      this.Seller 		 =
      {               
          ID         : journal.Seller.ID
        , Name       : journal.Seller.Name
        , MobileNo   : journal.Seller.MobileNo
        , Address    : journal.Seller.Address
      }               
      this.Client 		 =
      {               
          ID         : journal.Client.ID
        , Name       : journal.Client.Name
        , MobileNo   : journal.Client.MobileNo
        , Address    : journal.Client.Address
      }               
      this.Agent     =
      {               
          ID         : ''
        , Name       : ''         
        , MobileNo   : ''
      }               
      this.Arbiter     =
      {               
          ID         : ''
        , Name       : ''         
        , MobileNo   : ''
      }               
      this.History   = []
      this.Return 	 = ''
      this.State 		 = Model.states.Pending
      this.Event 		 = Model.event.Init
      this.OrderedAt = ''
    }

    async Init(_id)
    {
        this._id          = _id
        this.OrderedAt    = (new Date()).toISOString()

        await engine.Transition(this)
        Log('transit-initialised', { Data: this })
    }

}

module.exports = Transit
