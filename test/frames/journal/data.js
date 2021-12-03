let Journal = function(user, address, store, cart, agent)
{
  Journal.Count++

  this.JournalID  = ''
  this.Buyer      =
  { 
        ID        : user.ID 
      , Name      : user.Name
      , Address   : address.Address
      , Longitude : address.Longitude
      , Latitude  : address.Latitude
      , MobileNo  : user.MobileNo 
  }
  this.Store      =
  { 
        ID        : store.ID 
      , Name      : store.Name
      , Address   : store.Address
      , Image     : store.Image
      , Longitude : store.Longitude
      , Latitude  : store.Latitude
      , MobileNo  : store.MobileNo 
  }
  this.Agent      = 
  { 
        ID        : agent.ID 
      , Name      : agent.Name
      , MobileNo  : agent.MobileNo 
  }  
  this.Order      = 
  { 
        Products  : cart.Products
      , Bill      : cart.Bill 
  }
  this.Payment    =
  { 
        Channel   : 'Paytm'
      , Amount    : cart.Bill.Total.toString()
      , Status    : 'Success'
      , TimeStamp : '' 
  }
  this.Transit    =
  {
        ID        : user.TransitID 
      , Status    : 'Closed'
      , State     : 'Completed' 
  }
  Journal.Journals[user.Name]  = this
  Journal.Journals[store.Name] = this
}

Journal.Count      = 0
Journal.Journals   = {}

module.exports =
{
    Journal  : Journal
}