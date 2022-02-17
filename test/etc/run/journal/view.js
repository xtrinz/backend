const { mode } = require('../../../../pkg/sys/models')
    , data     = require('../../data')
    , sketch   = require('./sketch')

let Client = function(journal_) 
{
    this.JournalID = journal_
    this.Data      = function()
    {
      let journal = data.Get(data.Obj.Journal , this.JournalID)
      let p_client  = []
      for(let idx = 0; idx < journal.Order.Products.length; idx++)
      p_client.push({ Name : journal.Order.Products[idx].Name, Quantity : journal.Order.Products[idx].Quantity })
      let data_   =
      {
          JournalID   : journal.JournalID         // cart.Paytm.OrderID.slice(6)
        , Date        : ''
        , Client       : { Address: journal.Client.Address }
        , Seller       :
        {              
            ID        : journal.Seller.ID
          , Name      : journal.Seller.Name
          , Address   : journal.Seller.Address
          , Image     : journal.Seller.Image
        }              
        , Agent       :
        {              
            Name      : journal.Agent.Name
          , MobileNo  : journal.Agent.MobileNo
        }              
        , Order       : { Products  : p_client }       
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
    let client = data.Get(data.Obj.Client, journal.Client.Name)
    return sketch.View(mode.Client, journal.JournalID, client.Token, data_)
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
          , Client      :
          {             
              Name     : journal.Client.Name
            , MobileNo : journal.Client.MobileNo                  
            , Address  : journal.Client.Address
          }             
          , Seller      : 
          {             
              Name     : journal.Seller.Name
            , Address  : journal.Seller.Address
            , Image    : journal.Seller.Image
            , MobileNo : journal.Seller.MobileNo                  
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

let Seller = function(journal_) 
{
    this.JournalID = journal_
    this.Data      = function()
    {
      let journal  = data.Get(data.Obj.Journal , this.JournalID)
      let data_    =
      {
          JournalID   : journal.JournalID
        , Date        : ''
        , Client       : { Name: journal.Client.Name }
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

      let seller = data.Get(data.Obj.Seller, journal.Seller.Name)
      return sketch.View(mode.Seller, journal.JournalID, seller.Token, data_) 
    }
}

let Arbiter = function(journal_) 
{
    this.JournalID    = journal_
    this.Data         = function()
    {                  
      let journal     = data.Get(data.Obj.Journal , this.JournalID)
      let data_       = 
      {
          JournalID   : journal.JournalID
        , Date        : ''
        , Client       :
        {              
            Name      : journal.Client.Name
          , MobileNo  : journal.Client.MobileNo
          , Address   : journal.Client.Address              
        }              
        , Seller       :
        {              
            ID        : journal.Seller.ID
          , Name      : journal.Seller.Name
          , Address   : journal.Seller.Address
          , Image     : journal.Seller.Image
          , MobileNo  : journal.Seller.MobileNo                  
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
      let arbiter = data.Get(data.Obj.Arbiter, journal.Arbiter.Name)
      return sketch.View(mode.Arbiter, journal.JournalID, arbiter.Token, data_) 
  }
}

module.exports = { Client, Agent, Arbiter, Seller }