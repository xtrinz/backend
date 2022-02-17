const { states, mode } = require("../../../../pkg/sys/models")

let Arbiter = function()
{
  Arbiter.Count++
  let off = 90

  this.MobileNo    = '+9100110011{0}'.format(('00' + (Arbiter.Count + off)).substr(-2))
  this.Name        = mode.Arbiter + Arbiter.Count
  this.Email       = this.Name.toLowerCase() + '@' + (mode.Arbiter).toLowerCase() + '.com'
  this.Password    = 'Password' + this.Name
  this.Mode        = mode.Arbiter
  this.Token       = ''
  this.Socket      = ''
  this.Channel     = ''
  this.OTP         = ''
  this.TransitID   = ''
  this.Longitude   = '75.940163'
  this.Latitude    = '11.045950'
  this.State       = states.Registered

  Arbiter.Arbiters[this.Name] = this
}
Arbiter.Count = 0
Arbiter.Arbiters = {}

module.exports =
{
  Arbiter  : Arbiter
}