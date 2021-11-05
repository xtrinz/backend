const Model = require('../../system/models')

module.exports =
{
    [Model.verb.list]:
    {
          [Model.mode.User]: function(in_)
        {
            in_.Query = 
            {
                  State   : Model.states.Registered
                , 'Address.Location': { $geoWithin: { $center: [ [ in_.Latitude.loc(), in_.Longitude.loc()], 2500 ] } } 
            } 

            if(in_.Category) in_.Query.Type     = in_.Category
            if(in_.Text)     in_.Query['$text'] = { $search: in_.Text }
        }
        , [Model.mode.Admin]: function(in_)
          {
            switch(in_.Type)
            {
                case Model.qtype.NearList:
                in_.Query = { 'Address.Location': { $geoWithin: { $center: [ [ in_.Latitude.loc(), in_.Longitude.loc()], 2500 ] } } } 

                // TODO check unit of radius 2500

                if(in_.Category) in_.Query.Type     = in_.Category
                if(in_.Text)     in_.Query['$text'] = { $search: in_.Text }

                break
                case Model.qtype.Pending:
                in_.Query = { State : Model.states.ToBeApproved }
                break
                case Model.qtype.NearPending:
                in_.Query = 
                { 
                    'Address.Location'  :
                    { 
                        $near : { $geometry: 
                            { 
                                  type          : 'Point'
                                , coordinates   : [ in_.Longitude.loc(), in_.Latitude.loc() ] 
                            } } 
                    },
                    State     : Model.states.ToBeApproved
                }
                break
            }
          }
    }
}