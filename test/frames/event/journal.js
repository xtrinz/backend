const { Method, Type, Rest }  = require("../../lib/medium")
    , { prints }              = require("../../lib/driver")
    , jwt                     = require("../../../pkg/common/jwt")
    , { code, status, text }  = require("../../../pkg/common/error")

let Create = function(product, crt_entry, addr)
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
            Longitude           : addr.Longitude
          , Latitude            : addr.Latitude
          , Address             :
          {
                 Name           : addr.Address.Name
              , Line1           : addr.Address.Line1
              , Line2           : addr.Address.Line2
              , City            : addr.Address.City
              , PostalCode      : addr.Address.PostalCode
              , State           : addr.Address.State
              , Country         : addr.Address.Country
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
                  , Name        : product.Name
                  , Price       : product.Price
                  , Image       : product.Image
                  , Quantity    : crt_entry.Quantity
                }]
              , Bill            : 
                {
                    Total       : crt_entry.Quantity * product.Price
                  , TransitCost : 0
                  , Tax         : 0
                  , NetPrice    : crt_entry.Quantity * product.Price
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