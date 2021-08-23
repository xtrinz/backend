let Journal = function(user, address, store, cart, agent)
{
  Journal.Count++

  this.JournalID  = ''
  this.Buyer      = { ID : user.ID , Name : user.Name, Address  : address.Address, Longitude: address.Longitude, Latitude: address.Latitude }
  this.Seller     = { ID : store.ID , Name : store.Name, Address  : store.Address, Image: store.Image, Longitude: store.Longitude, Latitude: store.Latitude }
  this.Agent      = { ID : agent.ID , Name : agent.Name, MobileNo : agent.MobileNo }  
  this.Order      = { Products : cart.Products, Bill : cart.Bill }
  this.Payment    = { Channel : 'Paytm', Amount : cart.Bill.NetPrice.toString(), Status: 'Success', TimeStamp: '' }
  this.Transit    = { ID : user.TransitID , Status : 'Closed', ClosingState: 'TranistCompleted' }

  Journal.Journals[user.Name]  = this
  Journal.Journals[store.Name] = this
}

Journal.Count      = 0
Journal.Journals   = {}

module.exports =
{
    Journal  : Journal
}