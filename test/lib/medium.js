const qs = require('querystring')

const Type   =
{
      Rest  : 'REST'
    , Event : 'EVENT'
}

    , http   = require('http')
    , opt_g  = { host : 'localhost', port : process.env.PORT }

    , Method =
{
      GET   : 'GET'
    , POST  : 'POST'
    , PUT   : 'PUT'
    , DELETE: 'DELETE'
}

    , Rest  = function(in_)
{
    if(in_.Query) in_.Path = in_.Path + '?' + qs.stringify(in_.Query)
    let msg = JSON.stringify(in_.Body)

    let opts                      = { ...opt_g }
    opts['path']                  = in_.Path
    opts['method']                = in_.Method
    opts.headers                  = { ...in_.Header }
    opts.headers['Content-Type']  = 'application/json'                              
    opts.headers['Content-Length']= msg.length

    return new Promise((resolve, reject) =>
    {
        const req = http.request(opts, (res) =>
        {
            let data = ''
            res.on('data', (chunk) => data += chunk)
               .on('close', () => resolve({Code: res.statusCode, ...JSON.parse(data)}))
               .on('error', (err) => reject(err.stack))
        })
        req.write(msg)
        req.end()
        req.on('error', (err) => console.error(`Request Failed : ${err}`))
    })
}

module.exports =
{
      Method    : Method
    , Type      : Type
    , Rest      : Rest
}