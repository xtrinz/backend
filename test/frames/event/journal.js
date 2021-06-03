const { Method, Type, Rest }  = require("../../lib/medium")
    , { prints }              = require("../../lib/driver")
    , jwt                     = require("../../../pkg/common/jwt")
    , { code, status, text }  = require("../../../pkg/common/error")

let Create = function(journal)
{
  this.Data =
  {
      Type                      : Type.Rest
    , Describe                  : 'Journal Create [Checkout]'
    , Request                   :
    {
          Method                : Method.POST
        , Path                  : '/journal/create'
        , Body                  : 
        {
            Longitude           : journal.Longitude
          , Latitude            : journal.Latitude
          , Address             :
          {
                 Name           : journal.Address.Name
              , Line1           : journal.Address.Line1
              , Line2           : journal.Address.Line2
              , City            : journal.Address.City
              , PostalCode      : journal.Address.PostalCode
              , State           : journal.Address.State
              , Country         : journal.Address.Country
          }
        }
        , Header                : { Authorization: '' }
    }
    , Response                  :
    {
          Code                  : code.OK
        , Status                : status.Success
        , Text                  : text.PaymentInitiated
        , Data                  :
        {
            Sheet               :
            {
              Products          : 
                [{
                    ProductID   : ''
                  , Name        : journal.Products[0].Name
                  , Price       : journal.Products[0].Price
                  , Image       : journal.Products[0].Image
                  , Quantity    : journal.Products[0].Quantity
                }]
              , Bill            : 
                {
                    Total       : journal.Bill.Total
                  , TransitCost : journal.Bill.TransitCost
                  , Tax         : journal.Bill.Tax
                  , NetPrice    : journal.Bill.NetPrice
                }
            }
            , Stripe            : {}
        }
    }
  }

  this.PreSet        = async function(data)
  {
    console.log(prints.ReadParam)
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp  = await Rest(req)
    data.Response.Data.Sheet.Products[0].ProductID = resp.Data.ProductID
    data.Response.Data.Stripe = { ...resp.Data.Stripe }
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}



module.exports =
{
    Create
}