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
    opts_         = {...opt_g, ...opts_}
    opts_.headers = {...opts_.headers, Accept: 'application/json' }
    return new Promise((resolve, reject) =>
    {
        const req = http.request(opts_, (res) =>
        {
            let data = ''
            res.on('data', (chunk) => data += chunk)
               .on('close', () => resolve({Code: res.statusCode, ...JSON.parse(data)}))
               .on('error', (err) => reject(err.stack))
        })
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