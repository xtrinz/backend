let Address = function()
{
  Address.Count++

  this.Longitude  = '75.940163'
  this.Latitude   = '11.045950'
  this.Tag        = 'HOME'
  this.IsDefault  = true
  this.Name       = 'Address{0}.Name'.format(Address.Count)
  this.Line1      = 'Address{0}.Line1'.format(Address.Count)
  this.Line2      = 'Address{0}.Line2'.format(Address.Count)
  this.City       = 'Address{0}.City'.format(Address.Count)
  this.PostalCode = 110000 + Address.Count
  this.State      = 'Address{0}.State'.format(Address.Count)
  this.Country    = 'Address{0}.Country'.format(Address.Count)

  Address.Addresses[this.Name] = this
}

Address.Count      = 0
Address.Addresses  = {}

module.exports =
{
    Address  : Address
}