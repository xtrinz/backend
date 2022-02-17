const { verb } = require('../../sys/models')
    , Log      = require('../../sys/log')

module.exports =
{
    [verb.list]: function(in_)
    {
        Log('frame-agent-list-filter', { Input : in_ }) 

        in_.Query = {}
        if(in_.Status   != undefined) in_.Query[ 'State.Current' ]  = in_.Status        
        if(in_.State    != undefined) in_.Query.State               = in_.State
        if(in_.MobileNo != undefined) in_.Query.MobileNo            = in_.MobileNo

        if(in_.Latitude != undefined && in_.Longitude != undefined )
        in_.Query ['Location'] = {  $near : { $geometry: {  type : 'Point', coordinates   : [ in_.Longitude.loc(), in_.Latitude.loc() ] } } }

        Log('agent-list-filter', { Query: in_.Query })
    }

    , [verb.view]: {}
}