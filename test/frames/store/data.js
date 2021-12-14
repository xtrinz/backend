const { states } = require('../../../pkg/system/models')

let Store = function()
{
  Store.Count++

  this.ID           = ''
  this.Name         = 'Store{0}'.format(Store.Count)
  this.Image        = 'image.{0}.com'.format(this.Name.toLowerCase())
  this.Type         = 'Electorics'
  this.Certs        = ['a.cert', 'b.cert']
  this.Description  = 'Store Description'
  this.MobileNo     = '+9100110011{0}'.format(('00' + Store.Count).substr(-2))
  this.Email        = this.Name.toLowerCase() + '@' + this.Name.toLowerCase() + '.com'
  this.ClosingTime  = { Hour: 23, Minute: 59 }

  this.Status       = states.Running
  this.OTP 	        = ''
  this.State        = states.Registered
  this.Address      =
  {
        Line1       : '{0}.Line1'.format(this.Name)
      , Line2       : '{0}.Line2'.format(this.Name)
      , Longitude   : '75.935870'
      , Latitude 	  : '11.060447'
      , City        : '{0}.City'.format(this.Name)
      , PostalCode  : 123456
      , State       : '{0}.State'.format(this.Name)
      , Country     : '{0}.Country'.format(this.Name)
  }
  Store.Stores[this.Name] = this
}

Store.Count  = 0
Store.Stores = {}

module.exports =
{
  Store  : Store
}