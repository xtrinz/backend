const { Client }             = require('../infra/rest')
    , { Err_, code, reason } = require('./error')
    , Distance = async function(data)
{
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
    return 19.2 // Set it once APIs are ready
}
module.exports =
{
    Distance     : Distance
}