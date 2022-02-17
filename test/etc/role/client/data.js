const { mode } = require("../../../../pkg/sys/models")

let Client = function()
{
  Client.Count[mode.Client]++
  let off
  switch(mode.Client)
  {
  case 'Arbiter': off = 0 ; break;
  case 'Client' : off = 30; break;
  case 'Agent': off = 60; break;
  }
  this.MobileNo    = '+9100110011{0}'.format(('00' + (Client.Count[mode.Client] + off)).substr(-2))
  this.Name        = mode.Client + Client.Count[mode.Client]
  this.Email       = this.Name.toLowerCase() + '@' + mode.Client.toLowerCase() + '.com'
  this.Password    = 'Password' + this.Name
  this.Mode        = mode.Client
  this.Token       = ''
  this.Socket      = ''
  this.Channel     = ''
  this.OTP         = ''
  this.TransitID   = ''
  this.Latitude    = '17.20000'
  this.Longitude   = '17.20000'

  Client.Clients[this.Name] = this
}
Client.Count = { Arbiter: 0, Client: 0, Agent: 0 }
Client.Clients = {}

module.exports =
{
  Client  : Client
}