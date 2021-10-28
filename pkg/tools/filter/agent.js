const { verb, states, qtype } = require('../../system/models')

module.exports =
{
    [verb.list]: function(in_)
    {
        console.log('frame-agent-list-filter', { Input : in_ }) 
        switch(in_.SearchType)
        {
            case qtype.NearList:
            in_.Query = { Location: { $geoWithin: { $center: [ [ in_.Latitude.loc(), in_.Longitude.loc()], 2500 ] } } }

            // TODO check unit of radius 2500

            if(in_.Category) in_.Query.Type     = in_.Category
            if(in_.Text)     in_.Query['$text'] = { $search: in_.Text }

            break 
            case qtype.Pending:
 
            in_.Query = { State : states.ToBeApproved }
 
            break
            case qtype.NearPending:
 
            in_.Query = 
            { 
                Location  :
                { 
                    $near : { $geometry: 
                        { 
                                type          : 'Point'
                            , coordinates   : [ in_.Longitude.loc(), in_.Latitude.loc() ] 
                        } } 
                },
                State     : states.ToBeApproved
            }
 
            break
        }
        console.log('agent-list-filter', { Query: in_.Query })
    }

    , [verb.view]: {}
}