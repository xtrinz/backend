let Journal = function(user, address, store, agent, cart, admin)
{
  Journal.Count++
  this.Name       = user.Name
  this.JournalID  = ''
  this.Buyer      =
  { 
        ID        : ''
      , Name      : user.Name
      , MobileNo  : user.MobileNo 
      , Address   : address
  }
  this.Store      =
  { 
        ID        : ''
      , Name      : store.Name
      , MobileNo  : store.MobileNo
      , Image     : store.Image 
      , Address   : store.Address
  }
  this.Agent      = 
  { 
        ID        : '' 
      , Name      : agent.Name
      , MobileNo  : agent.MobileNo 
  }  
  this.Admin      =
  {
        ID        : ''
      , Name      : admin.Name
      , MobileNo  : admin.MobileNo
  }
  this.Order      = 
  { 
        Products  : cart.Products
  }
  this.Bill       =
  {
      Product     : cart.Bill.Product
    , Transit     : cart.Bill.Transit
    , Tax         : cart.Bill.Tax
    , Total       : cart.Bill.Total
  }
  this.Payment    =
  {
        Channel   : "Paytm"
      , OrderID   : "ORDER_61b9a7bd103850498be33cb2"
      , Token     : "txnToken"
      , RefID     : "ORDER_61b9a7bd103850498be33cb2"
      , Amount    : cart.Bill.Total.toString()
      , Status    : "Success"
      , TimeStamp : ''
  }
  this.Transit    =
  {
        ID        : ''
      , Status    : 'Closed'
      , State     : 'Completed'
  }
  Journal.Journals[this.Name]  = this
}

Journal.Count     = 0
Journal.Journals  = {}

module.exports = { Journal : Journal }