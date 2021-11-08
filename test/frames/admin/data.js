const { states } = require("../../../pkg/system/models")

let Admin = function(mode)
{
  Admin.Count++
  let off = 90

  this.MobileNo    = '+9100110011{0}'.format(('00' + (Admin.Count + off)).substr(-2))
  this.Name        = mode + Admin.Count
  this.Email       = this.Name.toLowerCase() + '@' + mode.toLowerCase() + '.com'
  this.Password    = 'Password' + this.Name
  this.Mode        = mode
  this.Token       = ''
  this.Socket      = ''
  this.Channel     = ''
  this.OTP         = ''
  this.TransitID   = ''
  this.Longitude   = '75.940163'
  this.Latitude    = '11.045950'
  this.State       = states.Registered

  Admin.Admins[this.Name] = this
}
Admin.Count = 0
Admin.Admins = {}

module.exports =
{
  Admin  : Admin
}