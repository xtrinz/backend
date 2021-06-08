
let User = function(mode)
{
  User.Count[mode]++
  let off
  switch(mode)
  {
  case 'Admin': off = 0 ; break;
  case 'User' : off = 30; break;
  case 'Agent': off = 60; break;
  }
  this.MobileNo    = '+9100110011{0}'.format(('00' + (User.Count[mode] + off)).substr(-2))
  this.Name        = mode + User.Count[mode]
  this.Email       = this.Name + '@' + mode + '.com'
  this.Password    = 'Password' + this.Name
  this.Mode        = mode
  this.Token       = ''
  this.SocketID    = ''
  this.OTP         = ''

  User.Users[this.Name] = this
}
User.Count = { Admin: 0, User: 0, Agent: 0 }
User.Users = {}

module.exports =
{
  User  : User
}