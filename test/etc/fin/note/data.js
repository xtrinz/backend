let Note = function()
{
  Note.Count++

  this.Type       = 'Terms and Conditions'
  this.Body       = 'The Terms and Condtions'

  Note.Notes[this.Name] = this
}

Note.Count  = 0
Note.Notes  = {}

module.exports =
{
    Note  : Note
}