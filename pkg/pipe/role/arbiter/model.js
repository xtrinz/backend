const Model = require('../../../sys/models')
const { ObjectId } = require('mongodb')

class Arbiter
{
    constructor(data)
    {
      this.MobileNo   = data.MobileNo
      this._id        = new ObjectId()
      this.Name       = ''
      this.Otp        = ''
      this.Mode       = Model.mode.Arbiter
      this.State      = Model.states.None
      this.Event      = Model.event.Create
      this.Name       = ''
      this.Location   =
        {
          type        : 'Point'
        , coordinates : [0, 88]
        }
    }
}

module.exports = Arbiter