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

// round to 2 decimal places
Number.prototype.round = function()
{
    const x = this
        , y = Math.pow(10, 2)
    return Math.round(x * y) / y
}