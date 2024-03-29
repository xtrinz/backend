                          require("dotenv").config()             // Read environment vars
                          require('../pkg/infra/paytm/setttings')
const { version  : v
    , resource : rsrc } = require('../pkg/sys/models')

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

String.prototype.slash = function(post) 
{
    let vn = this
        vn = '/' + vn
      post = (post == '/')? '' : '/' + post
    return vn + post
}

String.prototype.path = function() 
{
    let path = this

    if(!path || path == '') return ['null', 'null']

    path = path.split('?')
    path = path.shift()
    path = path.split('/')    

    let res = [], val
    while(path.length)
    {
        val = path.shift()
        if(val != '') res.push(val)
    }
    val = res.shift()

    if(val != v.v1)     return ['null', 'null']

    if(res.length == 1) res.push(rsrc.root)

    return res
}

String.prototype.loc = function() 
{
    let x = this
        x = parseFloat(x)
    return x
}

// Returns whether the time has touched the target
Date.prototype.is_below = function(target)
{
    const today = new Date()
    return (today.getHours()     < target.Hour)   ||
           ((today.getHours()   == target.Hour)   &&
            (today.getMinutes() <= target.Minute)  )
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
    const now = new Date()
        , end = new Date( now.getFullYear()
                        , now.getMonth()
                        , now.getDate()
                        , time_.Hour
                        , time_.Minute )
    const diff  = (end - now) / ( 1000 * 60 )
    return diff
}

Number.prototype.cmp = function(str_)
{
    const x = this
        , y = parseFloat(str_)
    return x == y
}

// round to 2 decimal places
Number.prototype.round = function()
{
    const x = this
        , y = Math.pow(10, 2)
    return Math.round(x * y) / y
}

Date.prototype.diff_in = function(iso_, min)
{
    const now = new Date()
        , end = new Date( iso_ )
    const diff  = (end - now) / ( 1000 * 60 )
    return diff < min
}

Number.prototype.cut = function(x)
{
    let val = this
         val *= x
    return val.round()
}