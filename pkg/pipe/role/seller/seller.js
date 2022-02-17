const Model        = require('../../../sys/models')

class Seller
{
    setMobileNo (mobileNo) { this.MobileNo  = mobileNo }
    setState    (state)    { this.State     = state    }
    setID       (id)       { this._id       = id       }

    constructor (data)
    {
        if (!data) return

        let init_ = new Date(0)
        let date_ =
        {
            Minute  : init_.getMinutes()
          , Hour    : init_.getHours()
          , Day     : init_.getDate()
          , Month   : init_.getMonth()
          , Year    : init_.getFullYear()
        }

        this.Email        = data.Email
        this.Image        = data.Image
        this.Certs        = data.Certs
        this.LedgerID     = ''
        this.Type         = data.Type
        this.Name         = data.Name
        this.Description  = data.Description
        this.MobileNo     = data.MobileNo
        this.Address      =
        {
            Location      :
            {
                  type        : 'Point'
                , coordinates : [
                      data.Address.Longitude.loc() 
                    , data.Address.Latitude.loc()
                ]
            }
            , Line1       : data.Address.Line1
            , Line2       : data.Address.Line2
            , City        : data.Address.City
            , PostalCode  : data.Address.PostalCode
            , State       : data.Address.State
            , Country     : data.Address.Country
        }
        this.ClosingTime  =
        {
              Hour        : data.ClosingTime.Hour
            , Minute      : data.ClosingTime.Minute
        }
        this.Status       =
        {
              Current     : Model.states.Closed
            , SetOn       : date_
        }
    }
}

module.exports = Seller