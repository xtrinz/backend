const qs        = require('querystring')
    , socketIo  = require('socket.io-client')

const Type   =
{
      Rest   : 'REST'
    , Event  : 'EVENT'
    , EWithR : 'EventWithRest'
}

    , http   = require('http')
    , opt_g  = { host : 'localhost', port : process.env.PORT }

    , Method =
{
      GET   : 'GET'
    , POST  : 'POST'
    , PUT   : 'PUT'
    , DELETE: 'DELETE'

    , CONNECT    : 'CONNECT'
    , DISCONNECT : 'DISCONNECT'
    , EVENT      : 'EVENT'    
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

    , Socket =
{
      Connect : async function(auth)
    {
        let socket   = await socketIo('http://'+ opt_g.host + ':' + opt_g.port, auth)
        return socket
    }
    , Read  : async function(socket)
    {
        let res = new Promise((resolve) =>
        {
            socket.on('Event', (resp) => { resolve(resp) } )
        })
        await res
        return res
    }
    , Disconnect : async function(socket)
    {
        await socket.disconnect()
    }
}

module.exports =
{
      Method    : Method
    , Type      : Type
    , Rest      : Rest
    , Socket    : Socket
}