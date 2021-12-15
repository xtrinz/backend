const { mode } = require('../../../pkg/system/models')
    , data     = require('../data')
    , sketch   = require('./sketch')

let User = function(journal_, user_, store_, agent_, cart_, admin_, mode_, addr_) 
{
    this.JournalID = journal_
    this.UserID    = user_
    this.StoreID   = store_
    this.AgentID   = agent_
    this.CartID    = cart_
    this.AdminID   = admin_
    this.Mode      = mode_
    this.AddressID = addr_

    this.Data      = function()
    {
      let journal = data.Get(data.Obj.Journal , this.JournalID)
      let user    = data.Get(data.Obj.User    , this.UserID)
      let agent   = data.Get(data.Obj.Agent   , this.AgentID)
      let cart    = data.Get(data.Obj.Cart    , this.CartID)
      let store   = data.Get(data.Obj.Store   , journal.Store.Name)
        , data_, token

      journal.Transit = { ID : user.TransitID }
      data.Set(data.Obj.Journal , this.JournalID, journal)
  
      let address = { ...data.Get(data.Obj.Address , this.AddressID)}
      delete address.IsDefault
      delete address.Tag
      address.AddressID = address.ID
      delete address.ID   

    // Ugly: Pls Forgive
    let prod = []
    for(let idx = 0; idx < journal.Order.Products.length; idx++)
    {
      let tmp  = journal.Order.Products[idx].CountAtCart
      let tmp1 = journal.Order.Products[idx].IsAvailable
      delete journal.Order.Products[idx].CountAtCart
      delete journal.Order.Products[idx].IsAvailable      
      prod.push({ ...journal.Order.Products[idx] })
      journal.Order.Products[idx].CountAtCart = tmp
      journal.Order.Products[idx].IsAvailable = tmp1
    }

    token = user.Token
            data_ = 
            {
                JournalID       : cart.Paytm.OrderID.slice(6)
              , Date            : ''
              , Buyer           : { Address: address }
              , Store          : 
              { 
                  ID            : store.ID
                , Name          : journal.Store.Name
                , Address       : journal.Store.Address
                , Image         : journal.Store.Image
              }
              , Agent           :
              {
                  Name          : agent.Name
                , MobileNo      : agent.MobileNo
              }
              , Order           :
              { 
                  Products      : prod
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
                , State         : 'Completed'
              }
            }

        let _id = cart.Paytm.OrderID.slice(6)
        return sketch.List(mode.User, _id, [ data_ ])

  }
}


let Agent = function(journal_, user_, store_, agent_, cart_, admin_, mode_, addr_) 
{
    this.JournalID = journal_
    this.UserID    = user_
    this.StoreID   = store_
    this.AgentID   = agent_
    this.CartID    = cart_
    this.AdminID   = admin_
    this.Mode      = mode_
    this.AddressID = addr_

    this.Data      = function()
    {
      let journal = data.Get(data.Obj.Journal , this.JournalID)
      let user    = data.Get(data.Obj.User    , this.UserID)
      let admin   = data.Get(data.Obj.Admin    , this.AdminID)      
      let agent   = data.Get(data.Obj.Agent   , this.AgentID)
      let cart    = data.Get(data.Obj.Cart    , this.CartID)
      let store   = data.Get(data.Obj.Store   , journal.Store.Name)
        , data_, token

      journal.Transit = { ID : user.TransitID }
      data.Set(data.Obj.Journal , this.JournalID, journal)
  
      let address = { ...data.Get(data.Obj.Address , this.AddressID)}
      delete address.IsDefault
      delete address.Tag
      address.AddressID = address.ID
      delete address.ID   

    // Ugly: Pls Forgive
    let prod = []
    for(let idx = 0; idx < journal.Order.Products.length; idx++)
    {
      let tmp  = journal.Order.Products[idx].CountAtCart
      let tmp1 = journal.Order.Products[idx].IsAvailable
      delete journal.Order.Products[idx].CountAtCart
      delete journal.Order.Products[idx].IsAvailable      
      prod.push({ ...journal.Order.Products[idx] })
      journal.Order.Products[idx].CountAtCart = tmp
      journal.Order.Products[idx].IsAvailable = tmp1
    }

    token = agent.Token
              data_ = 
              {
                  JournalID       : cart.Paytm.OrderID.slice(6)
                , Date            : ''
                , Buyer           :
                { 
                    Name          : journal.Buyer.Name
                  , Address       : address
                  , MobileNo      : journal.Buyer.MobileNo                  
                }
                , Store          : 
                { 
                    Name          : journal.Store.Name
                  , Address       : journal.Store.Address
                  , Image         : journal.Store.Image
                  , MobileNo      : journal.Store.MobileNo
                }
                , Penalty         : 0
                , Income          : .75 * journal.Order.Bill.TransitCost
                , Transit         : 
                { 
                    ID            : journal.Transit.ID
                  , Status        : 'Closed'
                  , State         : 'Completed'
                }
              }

              let _id = cart.Paytm.OrderID.slice(6)
              return sketch.List(mode.Agent, _id, [ data_ ])

  }
}

let Store = function(journal_, user_, store_, agent_, cart_, admin_, mode_, addr_) 
{
    this.JournalID = journal_
    this.UserID    = user_
    this.StoreID   = store_
    this.AgentID   = agent_
    this.CartID    = cart_
    this.AdminID   = admin_
    this.Mode      = mode_
    this.AddressID = addr_

    this.Data      = function()
    {
      let journal = data.Get(data.Obj.Journal , this.JournalID)
      let user    = data.Get(data.Obj.User    , this.UserID)
      let admin   = data.Get(data.Obj.Admin    , this.AdminID)      
      let agent   = data.Get(data.Obj.Agent   , this.AgentID)
      let cart    = data.Get(data.Obj.Cart    , this.CartID)
      let store   = data.Get(data.Obj.Store   , journal.Store.Name)
        , data_, token

      journal.Transit = { ID : user.TransitID }
      data.Set(data.Obj.Journal , this.JournalID, journal)
  
      let address = { ...data.Get(data.Obj.Address , this.AddressID)}
      delete address.IsDefault
      delete address.Tag
      address.AddressID = address.ID
      delete address.ID   

    // Ugly: Pls Forgive
    let prod = []
    for(let idx = 0; idx < journal.Order.Products.length; idx++)
    {
      let tmp  = journal.Order.Products[idx].CountAtCart
      let tmp1 = journal.Order.Products[idx].IsAvailable
      delete journal.Order.Products[idx].CountAtCart
      delete journal.Order.Products[idx].IsAvailable      
      prod.push({ ...journal.Order.Products[idx] })
      journal.Order.Products[idx].CountAtCart = tmp
      journal.Order.Products[idx].IsAvailable = tmp1
    }

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
            Products      : prod
          , Bill          : { Total: journal.Order.Bill.Total }
        }
        , Transit         : 
        { 
            ID            : journal.Transit.ID
          , Status        : 'Closed'
          , State         : 'Completed'
        }                
        , Penalty         : 0
        , Income          : journal.Order.Bill.Total
    }


    let _id = cart.Paytm.OrderID.slice(6)
    return sketch.List(mode.Store, _id, [ data_ ])

  }
}


let Admin = function(journal_, user_, store_, agent_, cart_, admin_, mode_, addr_) 
{
    this.JournalID = journal_
    this.UserID    = user_
    this.StoreID   = store_
    this.AgentID   = agent_
    this.CartID    = cart_
    this.AdminID   = admin_
    this.Mode      = mode_
    this.AddressID = addr_

    this.Data      = function()
    {
      let journal = data.Get(data.Obj.Journal , this.JournalID)
      let user    = data.Get(data.Obj.User    , this.UserID)
      let admin   = data.Get(data.Obj.Admin    , this.AdminID)      
      let agent   = data.Get(data.Obj.Agent   , this.AgentID)
      let cart    = data.Get(data.Obj.Cart    , this.CartID)
      let store   = data.Get(data.Obj.Store   , journal.Store.Name)
        , data_, token

      journal.Transit = { ID : user.TransitID }
      data.Set(data.Obj.Journal , this.JournalID, journal)
  
      let address = { ...data.Get(data.Obj.Address , this.AddressID)}
      delete address.IsDefault
      delete address.Tag
      address.AddressID = address.ID
      delete address.ID   

    // Ugly: Pls Forgive
    let prod = []
    for(let idx = 0; idx < journal.Order.Products.length; idx++)
    {
      let tmp  = journal.Order.Products[idx].CountAtCart
      let tmp1 = journal.Order.Products[idx].IsAvailable
      delete journal.Order.Products[idx].CountAtCart
      delete journal.Order.Products[idx].IsAvailable      
      prod.push({ ...journal.Order.Products[idx] })
      journal.Order.Products[idx].CountAtCart = tmp
      journal.Order.Products[idx].IsAvailable = tmp1
    }

    token = admin.Token
              data_ = 
              {
                  JournalID       : cart.Paytm.OrderID.slice(6)
                , Date            : ''
                , Buyer           :
                {
                    Name          : journal.Buyer.Name
                  , Address       : address
                  , MobileNo      : journal.Buyer.MobileNo
                }
                , Store           : 
                { 
                    ID            : store.ID
                  , Name          : journal.Store.Name
                  , Address       : journal.Store.Address
                  , Image         : journal.Store.Image
                  , MobileNo      : journal.Store.MobileNo                  
                }
                , Agent           :
                {
                    Name          : agent.Name
                  , MobileNo      : agent.MobileNo
                }
                , Order           :
                { 
                    Products      : prod
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
                  , State         : 'Completed'
                }
              }

    let _id = cart.Paytm.OrderID.slice(6)
    return sketch.List(mode.Admin, _id, [ data_ ])

  }
}

module.exports = { User, Agent, Admin, Store }