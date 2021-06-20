require('dotenv').config()

// Set string formater utility function
// '{0}'.format('1') : {0} get replaced with '1'
String.prototype.format = function() 
{
    let a = this
    for (k in arguments)
    {
      a = a.replace('{' + k + '}', arguments[k])
    }
    return a
}