let Journal = function(user, address, store, agent)
{
  Journal.Count++
  let cart        = cartOg.data.Cart.Carts[user.Name]

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
  this.Order      = 
  { 
        Products  : cart.Products
  }
  this.Bill       = cart.Bill 
  this.Payment    =
  { 
        Channel   : 'Paytm'
      , Amount    : cart.Bill.Total.toString()
      , Status    : 'Success'
      , TimeStamp : '' 
  }
  this.Transit    =
  {
        ID        : ''
      , Status    : 'Closed'
      , State     : 'Completed'
  }
  Journal.Journals[user.Name]  = this
  Journal.Journals[store.Name] = this
}

Journal.Count     = 0
Journal.Journals  = {}

module.exports = Journal