const { states, mode } = require("../../../../pkg/sys/models")

let Agent = function()
{
  Agent.Count++
  let off = 90

  this.MobileNo    = '+9100110011{0}'.format(('00' + (Agent.Count + off)).substr(-2))
  this.Name        = mode.Agent + Agent.Count
  this.Email       = this.Name.toLowerCase() + '@' + mode.Agent.toLowerCase() + '.com'
  this.Password    = 'Password' + this.Name
  this.Mode        = mode.Agent
  this.Token       = ''
  this.Socket      = ''
  this.Channel     = ''
  this.OTP         = ''
  this.TransitID   = ''
  this.Longitude   = '75.940163'
  this.Latitude    = '11.045950'
  this.State       = states.Registered
  this.Status      = states.OnDuty

  Agent.Agents[this.Name] = this
}
Agent.Count = 0
Agent.Agents = {}

module.exports =
{
  Agent  : Agent
}