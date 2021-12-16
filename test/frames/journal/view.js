const { mode } = require('../../../pkg/system/models')
    , data     = require('../data')
    , sketch   = require('./sketch')

let User = function(journal_) 
{
    this.JournalID = journal_
    this.Data      = function()
    {
      let journal = data.Get(data.Obj.Journal , this.JournalID)
      let p_user  = []
      for(let idx = 0; idx < journal.Order.Products.length; idx++)
      p_user.push({ Name : journal.Order.Products[idx].Name, Quantity : journal.Order.Products[idx].Quantity })
      let data_   =
      {
          JournalID   : journal.JournalID         // cart.Paytm.OrderID.slice(6)
        , Date        : ''
        , Buyer       : { Address: journal.Buyer.Address }
        , Store       :
        {              
            ID        : journal.Store.ID
          , Name      : journal.Store.Name
          , Address   : journal.Store.Address
          , Image     : journal.Store.Image
        }              
        , Agent       :
        {              
            Name      : journal.Agent.Name
          , MobileNo  : journal.Agent.MobileNo
        }              
        , Order       : { Products  : p_user }       
        , Bill        : journal.Order.Bill
        , Payment     : 
        {              
            Channel   : journal.Payment.Channel
          , Amount    : journal.Payment.Amount    // journal.Order.Bill.Total.toFixed(2).toString()
          , Status    : journal.Payment.Status
          , TimeStamp : journal.Payment.TimeStamp // skip
        }              
        , Transit     : 
        {              
            ID        : journal.Transit.ID
          , Status    : journal.Transit.Status
          , State     : journal.Transit.State
        }
      }
    let user = data.Get(data.Obj.User, journal.Buyer.Name)
    return sketch.View(mode.User, journal.JournalID, user.Token, data_)
  }
}

let Agent = function(journal_) 
{
    this.JournalID = journal_
    this.Data      = function()
    {
      let journal  = data.Get(data.Obj.Journal , this.JournalID)
      let data_    = 
      {
            JournalID  : journal.JournalID
          , Date       : ''
          , Buyer      :
          {             
              Name     : journal.Buyer.Name
            , MobileNo : journal.Buyer.MobileNo                  
            , Address  : journal.Buyer.Address
          }             
          , Store      : 
          {             
              Name     : journal.Store.Name
            , Address  : journal.Store.Address
            , Image    : journal.Store.Image
            , MobileNo : journal.Store.MobileNo                  
          }             
          , Transit    : 
          {             
              ID       : journal.Transit.ID
            , Status   : journal.Transit.Status
            , State    : journal.Transit.State
          }
      }
      let agent = data.Get(data.Obj.Agent, journal.Agent.Name)
      return sketch.View(mode.Agent, journal.JournalID, agent.Token, data_) 
  }
}

let Store = function(journal_) 
{
    this.JournalID = journal_
    this.Data      = function()
    {
      let journal  = data.Get(data.Obj.Journal , this.JournalID)
      let data_    =
      {
          JournalID   : journal.JournalID
        , Date        : ''
        , Buyer       : { Name: journal.Buyer.Name }
        , Agent       :
        {
            Name      : journal.Agent.Name
          , MobileNo  : journal.Agent.MobileNo
        }
        , Order       : { Products : journal.Order.Products }
        , Transit     : 
        { 
            ID        : journal.Transit.ID
          , Status    : journal.Transit.Status
          , State     : journal.Transit.State
        }                
      }

      let store = data.Get(data.Obj.Store, journal.Store.Name)
      return sketch.View(mode.Store, journal.JournalID, store.Token, data_) 
    }
}

let Admin = function(journal_) 
{
    this.JournalID    = journal_
    this.Data         = function()
    {                  
      let journal     = data.Get(data.Obj.Journal , this.JournalID)
      let data_       = 
      {
          JournalID   : journal.JournalID
        , Date        : ''
        , Buyer       :
        {              
            Name      : journal.Buyer.Name
          , MobileNo  : journal.Buyer.MobileNo
          , Address   : journal.Buyer.Address              
        }              
        , Store       :
        {              
            ID        : journal.Store.ID
          , Name      : journal.Store.Name
          , Address   : journal.Store.Address
          , Image     : journal.Store.Image
          , MobileNo  : journal.Store.MobileNo                  
        }              
        , Agent       :
        {              
            Name      : journal.Agent.Name
          , MobileNo  : journal.Agent.MobileNo
        }              
        , Order       : journal.Order
        , Bill        : journal.Bill
        , Payment     : 
        {              
            Channel   : journal.Payment.Channel
          , Amount    : journal.Payment.Amount
          , Status    : journal.Payment.Status
          , TimeStamp : journal.Payment.TimeStamp
        }              
        , Transit     : 
        {              
            ID        : journal.Transit.ID
          , Status    : journal.Transit.Status
          , State     : journal.Transit.State
        }
      }
      let admin = data.Get(data.Obj.Admin, journal.Admin.Name)
      return sketch.View(mode.Admin, journal.JournalID, admin.Token, data_) 
  }
}

module.exports = { User, Agent, Admin, Store }