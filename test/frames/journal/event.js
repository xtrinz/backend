const { Method, Type } = require('../../lib/medium')
    , { code, status } = require('../../../pkg/common/error')
    , { mode, source } = require('../../../pkg/common/models')
    , data             = require('../data')

let View = function(journal_, user_, cart_, mode_) 
{
    this.JournalID = journal_
    this.UserID    = user_
    this.CartID    = cart_
    this.Mode      = mode_

    this.Data      = function()
    {
      let user    = data.Get(data.Obj.User    , this.UserID)
      let cart    = data.Get(data.Obj.Cart    , this.CartID)
      let journal = data.Get(data.Obj.Journal , this.JournalID)
      let store   = data.Get(data.Obj.Store ,   journal.Seller.Name)
        , data_, src_
        switch (this.Mode)
        {
            case 'User' :
            src_  = source.User
            data_ = 
            {
                JournalID       : cart.Paytm.OrderID.slice(6)
              , Buyer           : { Address: journal.Buyer.Address }
              , Seller          : 
              { 
                  ID            : store.ID
                , Name          : journal.Seller.Name
                , Address       : journal.Seller.Address
                , Image         : journal.Seller.Image
              }
              , Order           :
              { 
                  Products      : journal.Order.Products
                , Bill          : journal.Order.Bill
              }
              , Payment         : 
              { 
                  Channel       : journal.Payment.Channel
                , Amount        : journal.Order.Bill.NetPrice.toFixed(2).toString()
                , Status        : journal.Payment.Status
                , TimeStamp     : '' 
              }
              , Transit         : 
              { 
                  ID            : user.TransitID
                , Status        : 'Closed'
                , ClosingState  : 'TranistCompleted'
              }
            }
            break;
            case mode.Agent:
                
            break;
            case mode.Admin:
                
            break;
        }

      let templ   =
      {
          Type             : Type.Rest
        , Describe         : 'Journal View'
        , Request          :
        {
              Method       : Method.GET
            , Path         : '/journal/view'
            , Body         : {}
            , Query        : 
            {
                Origin     : src_
              , JournalID  : cart.Paytm.OrderID.slice(6)
            }
            , Header       : { Authorization: 'Bearer ' + user.Token }
        }
        , Skip             : [ 'TimeStamp' ]
        , Response         :
        {
            Code           : code.OK
          , Status         : status.Success
          , Text           : ''
          , Data           : data_
        }
      }
    return templ
  }
}

module.exports =
{
    View
  //, List
}