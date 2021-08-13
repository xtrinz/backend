let Journal = function(user, address, store, cart)
{
  Journal.Count++

  this.JournalID  = ''
  this.Buyer      = { Address: address.Address }
  this.Seller     = { ID : store.ID , Name : store.Name, Address : store.Address, Image: store.Image }
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