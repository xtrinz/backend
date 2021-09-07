// require('../../cmd/settings')

const { Client }             = require('../infra/rest')
    , { Err_, code, reason } = require('./models')

const Distance = async function(data)
{
    return 5 // Set it once APIs are ready
    let in_     =
    {
          Domain  : 'maps.googleapis.com'
        , Path    : '/maps/api/distancematrix/json'
        , Port    : 80
        , Query   : 'origins={0},{1}|{2},{3}'.format(data.SrcLt, data.SrcLn, data.DestLt, data.DestLn)
        , Body    : null
        , Method  : 'GET'
        , Token   : ''
    }
        , req   = new Client(in_)
        , res   = await req.Fetch()
    if(res.Code !== 200) Err_(code.NOT_FOUND, reason.APIError)
    console.log('result : ', res)
}

let cord =
{
      SrcLt  : 11.060447
    , SrcLn  : 75.935870
    , DestLt : 11.045950
    , DestLn : 75.940163
}

//Distance(cord)

module.exports =
{
    Distance     : Distance
}