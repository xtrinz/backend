let Journal = function(client, address, seller, agent, cart, arbiter)
{
  Journal.Count++
  this.Name       = client.Name
  this.JournalID  = ''
  this.Client      =
  { 
        ID        : ''
      , Name      : client.Name
      , MobileNo  : client.MobileNo 
      , Address   : address
  }
  this.Seller      =
  { 
        ID        : ''
      , Name      : seller.Name
      , MobileNo  : seller.MobileNo
      , Image     : seller.Image 
      , Address   : seller.Address
  }
  this.Agent      = 
  { 
        ID        : '' 
      , Name      : agent.Name
      , MobileNo  : agent.MobileNo 
  }  
  this.Arbiter      =
  {
        ID        : ''
      , Name      : arbiter.Name
      , MobileNo  : arbiter.MobileNo
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