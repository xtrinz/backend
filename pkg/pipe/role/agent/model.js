const Model        = require('../../../sys/models')
    , { ObjectId } = require('mongodb')

class Agent
{
    constructor (data)
    {
        let date_ = new Date(0)
        let date  =
        {              
            Day      : date_.getDate()
          , Month    : date_.getMonth()
          , Year     : date_.getFullYear()
        }

        this._id           = new ObjectId()
        this.MobileNo      = data.MobileNo
        this.Mode          = Model.mode.Agent
        this.Otp           = ''
        this.State         = Model.states.None
        this.Status        = 
        {
              Current      : Model.states.OffDuty
            , SetOn        : date
        }
        this.Name          = ''
        this.Email         = ''
        this.LedgerID      = ''
        this.Text          = ''
        this.Location      =
        {
            type           : 'Point'
          , coordinates    : [0, 88]
        }
    }
}

module.exports = Agent