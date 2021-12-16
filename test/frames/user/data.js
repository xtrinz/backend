const { mode } = require("../../../pkg/system/models")

let User = function()
{
  User.Count[mode.User]++
  let off
  switch(mode.User)
  {
  case 'Admin': off = 0 ; break;
  case 'User' : off = 30; break;
  case 'Agent': off = 60; break;
  }
  this.MobileNo    = '+9100110011{0}'.format(('00' + (User.Count[mode.User] + off)).substr(-2))
  this.Name        = mode.User + User.Count[mode.User]
  this.Email       = this.Name.toLowerCase() + '@' + mode.User.toLowerCase() + '.com'
  this.Password    = 'Password' + this.Name
  this.Mode        = mode.User
  this.Token       = ''
  this.Socket      = ''
  this.Channel     = ''
  this.OTP         = ''
  this.TransitID   = ''
  this.Latitude    = '17.20000'
  this.Longitude   = '17.20000'

  User.Users[this.Name] = this
}
User.Count = { Admin: 0, User: 0, Agent: 0 }
User.Users = {}

module.exports =
{
  User  : User
}