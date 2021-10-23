// require('../../cmd/settings')

const axios                   = require('axios')
    , api_key                 = process.env.GOOGLE_KEY
    , { Err_, code , reason } = require('../system/models')

const Distance = async function(data)
{
    if((data.SrcLt == 0          &&
        data.SrcLt == data.DestLt && 
        data.SrcLn == data.DestLn ) ||
      ( data.SrcLt == data.DestLt && 
        data.SrcLn == data.DestLn ))
      {
        if(data.SrcLt == 0)
        console.log('unset-cordinates', { Data: data })
        else
        {
          console.log('equal-src-and-destn', { Data: data })
        }
        return 0
      }
    const in_     =
    {
          Method  : 'get'
        , Domain  : 'https://maps.googleapis.com'
        , Path    : '/maps/api/distancematrix/json'
        , Port    : 80
        , Query   : '?origins={0}%2C{1}&destinations={2}%2C{3}&key={4}'.format(data.SrcLt //
                                                                             , data.SrcLn
                                                                             , data.DestLt //
                                                                             , data.DestLn
                                                                             , api_key) 
    }
    const config = 
    {
      method: in_.Method,
      url: in_.Domain + in_.Path + in_.Query, 
      headers: { }
    }
    console.log('google-map-distance-query', { Query: config })
    let res = await axios(config)
    if(!res || !res.data || res.data.status !== 'OK')
    {
      console.log('map-api-request-failed', { Query: config, Response: res })
      Err_(code.INTERNAL_SERVER, reason.MapQueryFailed)
    }

    if(res &&
       res.data.rows &&
       res.data.rows[0] &&
       res.data.rows[0].elements &&
       res.data.rows[0].elements[0] &&
       res.data.rows[0].elements[0].distance)
    {
      let dist = res.data.rows[0].elements[0].distance
      console.log('result : ', dist, dist.value / 1000)
      return dist.value / 1000
    }

    console.log('map-api-incorrect-response-format', { Query: config, Response: JSON.stringify(res.data) })
    Err_(code.INTERNAL_SERVER, reason.MapQueryFailed)
}

let cord =
{
      SrcLt  : 11.060447
    , SrcLn  : 75.935870
    , DestLt : 11.045950
    , DestLn : 75.940163
}

// Distance(cord)

module.exports =
{
    Distance     : Distance
}
