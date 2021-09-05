const qs        = require('querystring')
    , fs        = require('fs')
    , socketIo  = require('socket.io-client')

let SockQ    = {}

const Type   =
{
      Rest   : 'REST'
    , Event  : 'EVENT'
    , EWithR : 'EventWithRest'
}

    , https  = require('https')
    , ca     = { ca: fs.readFileSync('cert/ca.crt') } 
    , opt_g  = { host : 'localhost', port : process.env.PORT, ca: fs.readFileSync('cert/ca.crt'), ...ca }

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
        const req = https.request(opts, (res) =>
        {
            let data = ''
            res.on('data', (chunk) => data += chunk)
               .on('close', () => 
                {
                    let data_ = { ...JSON.parse(data) }

                    if(res.headers['authorization'])
                    data_.Data.Token = res.headers['authorization']

                    resolve({ Code : res.statusCode, ...data_ })
                })
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
        let socket   = await socketIo('https://'+ opt_g.host + ':' + opt_g.port, { ...auth, ...ca })
        socket.on('Event', (msg) => 
        {
            if(!SockQ[socket.id]) {SockQ[socket.id] = []}
            SockQ[socket.id].push(msg) 
        })
        return {Socket: socket, Channel: {} }
    }
    , Read  : async function(socket)
    {
        let result = SockQ[socket.id].shift() 
        return result
    }
    , Disconnect : async function(socket)
    {
        delete SockQ[socket.id]
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