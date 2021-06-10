const { Method, Type }       = require("../../lib/medium")
    , { code, status, text } = require("../../../pkg/common/error")
    , data                   = require("../data/data")

let Create = function(user_, addr_, cart_) 
{
  this.UserID  	 = user_
  this.AddressID = addr_
  this.CartID    = cart_
  this.Data      = function()
  {
    let user     = data.Get(data.Obj.User,    this.UserID)
    let addr     = data.Get(data.Obj.Address, this.AddressID)
    let cart     = data.Get(data.Obj.Cart,    this.CartID)

    let templ =
    {
        Type              : Type.Rest
      , Describe          : 'Journal Create [Checkout]'
      , Request           :
      {                     
          Method          : Method.POST
        , Path            : '/journal/create'
        , Body            : 
        {                     
            Longitude     : addr.Longitude
          , Latitude      : addr.Latitude
          , Address       : addr.Address
        }                     
        , Header          : { Authorization: 'Bearer ' + user.Token }
      }                       
      , Skip              : [ 'Stripe' ]                    
      , Response          :
      {                       
          Code            : code.OK
        , Status          : status.Success
        , Text            : text.PaymentInitiated
        , Data            :
        {                       
          Sheet           :
          {                     
            Products      : cart.Products
          , Bill          : 
            {                 
              Total       : cart.Bill.Total
            , TransitCost : cart.Bill.TransitCost
            , Tax         : cart.Bill.Tax
            , NetPrice    : cart.Bill.NetPrice
            }               
          }                 
          , Stripe        : {}
        }
      }
    }
    return templ
  }
}

let ConfirmPayment = function(journal)
{
  this.Data =
  {
      Type                      : Type.Rest
    , Describe                  : 'Journal Confirm Payment'
    , Request                   :
    {
          Method                : Method.POST
        , Path                  : '/journal/confirm'
        , Body                  : {/* Masked Sign Verification for test */}
        , Header                : {}
    }
    , Response                  :
    {
          Code                  : code.OK
        , Status                : status.Success
        , Text                  : ''
        , Data                  : {}
    }
  }
}

module.exports =
{
    Create, ConfirmPayment
}