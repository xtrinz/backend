let Address = function()
{
  Address.Count++

  this.Longitude = '17.20000'
  this.Latitude  = '17.20000'
  this.Tag       = 'HOME'
  this.IsDefault = true
  this.Address   =
  {              
      Name       : 'Address{0}.Name'.format(Address.Count)
    , Line1      : 'Address{0}.Line1'.format(Address.Count)
    , Line2      : 'Address{0}.Line2'.format(Address.Count)
    , City       : 'Address{0}.City'.format(Address.Count)
    , PostalCode : 110000 + Address.Count
    , State      : 'Address{0}.State'.format(Address.Count)
    , Country    : 'Address{0}.Country'.format(Address.Count)
  }

  Address.Addresses[this.Address.Name] = this
}

Address.Count      = 0
Address.Addresses  = {}

module.exports =
{
    Address  : Address
}