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

    , Rest  = function(opts_)
{
    let opts                      = { ...opt_g }
    opts['path']                  = opts_.path
    opts['method']                = opts_.method
    let data                      = JSON.stringify(opts_.body)
    opts.headers                  = { ...opts_.headers }
    opts.headers['Content-Type']  = 'application/json'
    opts.headers['Content-Length']= data.length

    return new Promise((resolve, reject) =>
    {
        const req = http.request(opts, (res) =>
        {
            let data = ''
            res.on('data', (chunk) => data += chunk)
               .on('close', () => resolve({Code: res.statusCode, ...JSON.parse(data)}))
               .on('error', (err) => reject(err.stack))
        })
        req.write(data)
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