const { Method, Type }        = require('../../lib/medium')
    , { code, status, mode }  = require('../../../pkg/system/models')
    , data                    = require('../data')

let View = function(journal_, user_, store_, agent_, cart_, admin_, mode_) 
{
    this.JournalID = journal_
    this.UserID    = user_
    this.StoreID   = store_
    this.AgentID   = agent_
    this.CartID    = cart_
    this.AdminID   = admin_
    this.Mode      = mode_

    this.Data      = function()
    {
      let journal = data.Get(data.Obj.Journal , this.JournalID)
      let user    = data.Get(data.Obj.User    , this.UserID)
      let admin   = data.Get(data.Obj.User    , this.AdminID)      
      let agent   = data.Get(data.Obj.User    , this.AgentID)
      let cart    = data.Get(data.Obj.Cart    , this.CartID)
      let store   = data.Get(data.Obj.Store   , journal.Seller.Name)
        , data_, src_, token

      journal.Transit = { ID : user.TransitID }
      data.Set(data.Obj.Journal , this.JournalID, journal)
  
        switch (this.Mode)
        {
            case mode.User :
            token = user.Token
            data_ = 
            {
                JournalID       : cart.Paytm.OrderID.slice(6)
              , Date            : ''
              , Buyer           : { Address: journal.Buyer.Address }
              , Seller          : 
              { 
                  ID            : store.ID
                , Name          : journal.Seller.Name
                , Address       : journal.Seller.Address
                , Image         : journal.Seller.Image
              }
              , Agent           :
              {
                  Name          : agent.Name
                , MobileNo      : agent.MobileNo
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
                  ID            : journal.Transit.ID
                , Status        : 'Closed'
                , State  : 'TranistCompleted'
              }
            }
            break;
            case mode.Agent:
              token = agent.Token
              data_ = 
              {
                  JournalID       : cart.Paytm.OrderID.slice(6)
                , Date            : ''
                , Buyer           :
                { 
                    Name          : journal.Buyer.Name
                  , Address       : journal.Buyer.Address
                  , Longitude     : journal.Buyer.Longitude
                  , Latitude      : journal.Buyer.Latitude
                }
                , Seller          : 
                { 
                    Name          : journal.Seller.Name
                  , Address       : journal.Seller.Address
                  , Image         : journal.Seller.Image
                  , Longitude     : journal.Seller.Longitude
                  , Latitude      : journal.Seller.Latitude
                }
                , Penalty         : 0
                , Income          : .75 * journal.Order.Bill.TransitCost
                , Transit         : 
                { 
                    ID            : journal.Transit.ID
                  , Status        : 'Closed'
                  , State  : 'TranistCompleted'
                }
              }
            break;
            case mode.Admin:
              token = admin.Token
              data_ = 
              {
                  JournalID       : cart.Paytm.OrderID.slice(6)
                , Date            : ''
                , Buyer           :
                {
                    Name          : journal.Buyer.Name
                  , Address       : journal.Buyer.Address
                  , Longitude     : journal.Buyer.Longitude
                  , Latitude      : journal.Buyer.Latitude
                }
                , Seller          : 
                { 
                    ID            : store.ID
                  , Name          : journal.Seller.Name
                  , Address       : journal.Seller.Address
                  , Image         : journal.Seller.Image
                  , Longitude     : journal.Seller.Longitude
                  , Latitude      : journal.Seller.Latitude
                }
                , Agent           :
                {
                    Name          : agent.Name
                  , MobileNo      : agent.MobileNo
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
                , Penalty         : { Buyer: 0, Store: 0, Agent: 0, Business: 0 }
                , Refund          : 0
                , Transit         : 
                { 
                    ID            : journal.Transit.ID
                  , Status        : 'Closed'
                  , State  : 'TranistCompleted'
                }
              }
            break;
            case mode.Store :
            token = store.Token
            data_ = 
            {
                JournalID       : cart.Paytm.OrderID.slice(6)
              , Date            : ''
              , Buyer           : { Name: journal.Buyer.Name }
              , Agent           :
              {
                  Name          : agent.Name
                , MobileNo      : agent.MobileNo
              }
              , Order           :
              { 
                  Products      : journal.Order.Products
                , Bill          : { Total: journal.Order.Bill.Total }
              }
              , Transit         : 
              { 
                  ID            : journal.Transit.ID
                , Status        : 'Closed'
                , State  : 'TranistCompleted'
              }                
              , Penalty         : 0
              , Income          : journal.Order.Bill.Total
            }
            break;
        }

      let templ   =
      {
          Type             : Type.Rest
        , Describe         : 'Journal View ' + this.Mode
        , Request          :
        {
              Method       : Method.GET
            , Path         : '/v1/journal/view'
            , Body         : {}
            , Query        : 
            {
                JournalID  : cart.Paytm.OrderID.slice(6)
            }
            , Header       : { Authorization: token }
        }
        , Skip             : [ 'TimeStamp', 'Date' ]
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

let List = function(journal_, user_, store_, agent_, cart_, admin_, mode_) 
{
    this.JournalID = journal_
    this.UserID    = user_
    this.StoreID   = store_
    this.AgentID   = agent_
    this.CartID    = cart_
    this.AdminID   = admin_
    this.Mode      = mode_

    this.Data      = function()
    {
      let journal = data.Get(data.Obj.Journal , this.JournalID)
      let user    = data.Get(data.Obj.User    , this.UserID)
      let admin   = data.Get(data.Obj.User    , this.AdminID)      
      let agent   = data.Get(data.Obj.User    , this.AgentID)
      let cart    = data.Get(data.Obj.Cart    , this.CartID)
      let store   = data.Get(data.Obj.Store   , journal.Seller.Name)
        , data_, token

      journal.Transit = { ID : user.TransitID }
      data.Set(data.Obj.Journal , this.JournalID, journal)
  
        switch (this.Mode)
        {
            case mode.User :
            token = user.Token
            data_ = 
            {
                JournalID       : cart.Paytm.OrderID.slice(6)
              , Date            : ''
              , Buyer           : { Address: journal.Buyer.Address }
              , Seller          : 
              { 
                  ID            : store.ID
                , Name          : journal.Seller.Name
                , Address       : journal.Seller.Address
                , Image         : journal.Seller.Image
              }
              , Agent           :
              {
                  Name          : agent.Name
                , MobileNo      : agent.MobileNo
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
                  ID            : journal.Transit.ID
                , Status        : 'Closed'
                , State  : 'TranistCompleted'
              }
            }
            break;
            case mode.Agent:
              token = agent.Token
              data_ = 
              {
                  JournalID       : cart.Paytm.OrderID.slice(6)
                , Date            : ''
                , Buyer           :
                { 
                    Name          : journal.Buyer.Name
                  , Address       : journal.Buyer.Address
                  , Longitude     : journal.Buyer.Longitude
                  , Latitude      : journal.Buyer.Latitude
                }
                , Seller          : 
                { 
                    Name          : journal.Seller.Name
                  , Address       : journal.Seller.Address
                  , Image         : journal.Seller.Image
                  , Longitude     : journal.Seller.Longitude
                  , Latitude      : journal.Seller.Latitude
                }
                , Penalty         : 0
                , Income          : .75 * journal.Order.Bill.TransitCost
                , Transit         : 
                { 
                    ID            : journal.Transit.ID
                  , Status        : 'Closed'
                  , State  : 'TranistCompleted'
                }
              }
            break;
            case mode.Admin:
              token = admin.Token
              data_ = 
              {
                  JournalID       : cart.Paytm.OrderID.slice(6)
                , Date            : ''
                , Buyer           :
                {
                    Name          : journal.Buyer.Name
                  , Address       : journal.Buyer.Address
                  , Longitude     : journal.Buyer.Longitude
                  , Latitude      : journal.Buyer.Latitude
                }
                , Seller          : 
                { 
                    ID            : store.ID
                  , Name          : journal.Seller.Name
                  , Address       : journal.Seller.Address
                  , Image         : journal.Seller.Image
                  , Longitude     : journal.Seller.Longitude
                  , Latitude      : journal.Seller.Latitude
                }
                , Agent           :
                {
                    Name          : agent.Name
                  , MobileNo      : agent.MobileNo
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
                , Penalty         : { Buyer: 0, Store: 0, Agent: 0, Business: 0 }
                , Refund          : 0
                , Transit         : 
                { 
                    ID            : journal.Transit.ID
                  , Status        : 'Closed'
                  , State  : 'TranistCompleted'
                }
              }
            break;
            case mode.Store :
            token = store.Token
            data_ = 
            {
                JournalID       : cart.Paytm.OrderID.slice(6)
              , Date            : ''
              , Buyer           : { Name: journal.Buyer.Name }
              , Agent           :
              {
                  Name          : agent.Name
                , MobileNo      : agent.MobileNo
              }
              , Order           :
              { 
                  Products      : journal.Order.Products
                , Bill          : { Total: journal.Order.Bill.Total }
              }
              , Transit         : 
              { 
                  ID            : journal.Transit.ID
                , Status        : 'Closed'
                , State  : 'TranistCompleted'
              }                
              , Penalty         : 0
              , Income          : journal.Order.Bill.Total
            }
            break;
        }

      let templ   =
      {
          Type             : Type.Rest
        , Describe         : 'Journal List ' + this.Mode
        , Request          :
        {
              Method       : Method.GET
            , Path         : '/v1/journal/list'
            , Body         : {}
            , Query        : 
            {
                Page       : 1
              , Limit      : 8
            }
            , Header       : { Authorization: token }
        }
        , Skip             : [ 'TimeStamp', 'Date' ]
        , Response         :
        {
            Code           : code.OK
          , Status         : status.Success
          , Text           : ''
          , Data           : [ data_ ]
        }
      }
    return templ
  }
}

module.exports =
{
    View
  , List
}