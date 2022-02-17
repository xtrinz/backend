const qs   = require('querystring')
    , http = require('http')
    , Log  = require('../sys/log')

function Client(in_)
{
    this.Domain = in_.Domain
    this.Path   = in_.Path
    this.Port   = in_.Port
    this.Query  = in_.Query
    this.Body   = JSON.stringify(in_.Body)
    this.Method = in_.Method
    this.Token  = in_.Token

    this.Options   = function()
    {
        let opt =
        {             
              host        : this.Domain
            , path        : (this.Query)? this.Path + '?' + this.Query : this.Path
            , method      : this.Method
        }
        return opt
    }
    this.Fetch      = async function()
    {
        Log(this.Options())
        let resp = await new Promise((resolve, reject) =>
        {
            const req = http.request(this.Options(), (res) =>
            {
                let data = ''
                res.on('data' , (chunk) => data += chunk)
                   .on('close', ()      => resolve({Code: res.statusCode, Data: JSON.parse(data) }))
                   .on('error', (err)   => reject(err.stack))
            })
            req.write(this.Body)
            req.end()
            req.on('error', (err) => { console.error('rest-request-failed', { Err: err }) })
        })
        return resp
    }
}

/*
let req = {
      Domain  : 'maps.googleapis.com' // 'localhost'
    , Path    : '/maps/api/distancematrix/json' // '/test'
    , Port    : 80 // 3001
    , Query   : 'origins=41.43206,-81.38992|-33.86748,151.20699'
    , Body    : null
    , Method  : 'GET'
    , Token   : ''
}

let r = new Client(req)
r.Fetch().then((res) => { Log(res) })
*/

module.exports = { Client : Client }