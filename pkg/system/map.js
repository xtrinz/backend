// require('../../cmd/settings')

const axios                   = require('axios')
    , api_key                 = process.env.GOOGLE_KEY
    , { Err_, code , reason } = require('../system/models')

const Distance = async function(cords_)
{

    /* TODO Blocked for testing */
    return 2.459

    if((cords_.Src.Latitude   == 0                       &&
        cords_.Src.Latitude   == cords_.Dest.Latitude    && 
        cords_.Src.Longitude  == cords_.Dest.Longitude ) ||
      ( cords_.Src.Latitude   == cords_.Dest.Latitude    && 
        cords_.Src.Longitude  == cords_.Dest.Longitude   ))
      {

        if(cords_.Src.Latitude == 0)
        console.log('unset-cordinates', { Data: cords_ })
        else
        console.log('equal-src-and-destn', { Data: cords_ })

        return 0
      }
    const in_     =
    {
          Method  : 'get'
        , Domain  : 'https://maps.googleapis.com'
        , Path    : '/maps/api/distancematrix/json'
        , Port    : 80
        , Query   : '?origins={0}%2C{1}&destinations={2}%2C{3}&key={4}'.format(cords_.Src.Latitude
                                                                             , cords_.Src.Longitude
                                                                             , cords_.Dest.Latitude
                                                                             , cords_.Dest.Longitude
                                                                             , api_key) 
    }
    const config = 
    {
      method  : in_.Method,
      url     : in_.Domain + in_.Path + in_.Query,
      headers : {}
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

const cord = 
{
      Src  : { Latitude  : 11.060447, Longitude : 75.935870 }
    , Dest : { Latitude  : 11.045950, Longitude : 75.940163 }
}
// Distance(cord)

module.exports = { Distance }