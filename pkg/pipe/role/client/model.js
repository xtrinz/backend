const Model         = require('../../../sys/models')
const { ObjectId }  = require('mongodb')

class Client
{
    constructor(data)
    {
      this.MobileNo    = data.MobileNo
      this._id         = new ObjectId()
      this.Name        = ''
      this.Otp         = ''
      this.Mode        = Model.mode.Client
      this.Email       = ''
      this.State       = Model.states.None
      this.Event       = Model.event.Create
      this.Name        = ''
      this.CartID      = ''      
      this.LedgerID    = ''
      this.AddressList = []
      this.Location    =
        {
          type         : 'Point'
        , coordinates  : [0, 88]
        }
    }
}

module.exports = Client