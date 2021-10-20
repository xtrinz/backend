let Agent = function(mode)
{
  Agent.Count++
  let off = 90

  this.MobileNo    = '+9100110011{0}'.format(('00' + (Agent.Count + off)).substr(-2))
  this.Name        = mode + Agent.Count
  this.Email       = this.Name.toLowerCase() + '@' + mode.toLowerCase() + '.com'
  this.Password    = 'Password' + this.Name
  this.Mode        = mode
  this.Token       = ''
  this.Socket      = ''
  this.Channel     = ''
  this.OTP         = ''
  this.TransitID   = ''
  this.Latitude    = '17.20000'
  this.Longitude   = '17.20000'

  Agent.Agents[this.Name] = this
}
Agent.Count = 0
Agent.Agents = {}

module.exports =
{
  Agent  : Agent
}