                         require("dotenv").config()             // Read environment vars
                         require('../pkg/infra/paytm/setttings')
const { version  : v } = require('../pkg/system/models')

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

    if(!x || x == '' || !x.startsWith(v.v1)) 
        return ['null', 'null']

    x = x.slice(v.v1.length)

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

// Returns whether the time is in given span
// lb = { Hour: 8, Minute: 15 }
// ub = { Hour: 9, Minute: 30 }
Date.prototype.is_now = function(lb, ub)
{
    const today = new Date()
    return (today.getHour()    >= lb.Hour)   &&
           (today.getHour()    <= ub.Hour)   &&
           (today.getMinutes() >= lb.Minute) &&
           (today.getMinutes() <= ub.Minute)
}

Date.prototype.is_today = function(date_)
{
    const today = this
    return  date_.Day   == today.getDate()  &&
            date_.Month == today.getMonth() &&
            date_.Year  == today.getFullYear()
}

Date.prototype.diff_in_m = function(time_)
{
    const now = new Date
        , end = new Date( now.getFullYear()
                        , now.getMonth()
                        , now.getDate()
                        , time_.Hour
                        , time_.Minute )
    const diff  = (end - now) / ( 1000 * 60 )
    return diff
}