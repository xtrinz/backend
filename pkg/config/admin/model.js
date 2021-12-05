const Model = require('../../system/models')
const { ObjectId } = require('mongodb')

class Admin
{
    constructor(data)
    {
      this.MobileNo   = data.MobileNo
      this._id        = new ObjectId()
      this.Name       = ''
      this.Otp        = ''
      this.Mode       = Model.mode.Admin
      this.State      = Model.states.None
      this.Event      = Model.event.Create
      this.Name       = ''
      this.SockID     = []
      this.Location   =
        {
          type        : 'Point'
        , coordinates : [0, 88]
        }
      this.IsLive     = false
    }
}

module.exports = Admin