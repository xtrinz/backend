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
    let opts                      = { ...opt_g }
    opts['path']                  = in_.Path
    opts['method']                = in_.Method
    opts.headers                  = { ...in_.headers }
    opts.headers['Content-Type']  = 'application/json'

    let body                      = JSON.stringify(in_.Body)
    opts.headers['Content-Length']= body.length

    return new Promise((resolve, reject) =>
    {
        const req = http.request(opts, (res) =>
        {
            let data = ''
            res.on('data', (chunk) => data += chunk)
               .on('close', () => resolve({Code: res.statusCode, ...JSON.parse(data)}))
               .on('error', (err) => reject(err.stack))
        })
        req.write(body)
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