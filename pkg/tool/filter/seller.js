const Model = require('../../sys/models')

module.exports =
{
  [Model.verb.list]:
  {
        [Model.mode.Client]: function(in_)
      {
          in_.Query = 
          {
                State   : Model.states.Registered
              , 'Address.Location': { $geoWithin: { $center: [ [ in_.Latitude.loc(), in_.Longitude.loc()], 2500 ] } } 
          } 
          if(in_.Category) in_.Query.Type     = in_.Category
          if(in_.Text)     in_.Query['$text'] = { $search: in_.Text }
      }
      , [Model.mode.Arbiter]: function(in_)
        {
          in_.Query = {}
          if(in_.State    != undefined) in_.Query.State  = in_.State
          if(in_.MobileNo != undefined) in_.Query.MobileNo  = in_.MobileNo

          if(in_.Latitude && in_.Longitude)
          in_.Query ['Address.Location']  =
              { 
                  $near : { $geometry: {  type : 'Point', coordinates   : [ in_.Longitude.loc(), in_.Latitude.loc() ] } } 
              }
        }
  }
}