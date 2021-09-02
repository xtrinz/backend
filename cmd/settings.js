// Read environment vars file
require("dotenv").config()
require('../pkg/infra/paytm/setttings')

// Set string formater utility function
// "{0}".format("1") : {0} get replaced with "1"
String.prototype.format = function() 
{
    let a = this
    for (k in arguments)
    {
      a = a.replace("{" + k + "}", arguments[k])
    }
    return a
}  

String.prototype.path = function() 
{
    let res = [], k = 0, x = this
    if(x.length === 1 || x[x.length - 1] !== '/') x += '/'
    for(let i = 1; i < x.length; i++)
    if(x[i] === '/' || i === x.length - 1 || x[i] === '?')
    {
        res.push(x.slice(k, i))
        if(res.length === 2) break
        k = i
    }
    if(res.length !== 2) res.push(x.slice(k))
    return res
}

String.prototype.loc = function() 
{
    let x = this
        x = parseFloat(x)
    return x
}

Number.prototype.revloc = function() 
{
    let x = this
    console.log('##', this)
    this  //= x.toFixed(5)
}