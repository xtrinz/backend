const { verb, method } = require('../../../system/models')

module.exports =
{
    [verb.view]                :
    {
      [method.get]             :
      {
          'query'              : [ 'required', 'object' ]
        , 'headers'            : [ 'required', 'object' ]
        , 'query.JournalID'    : [ [ 'requiredWithout', 'query.IsLive' ], 'mongoId']
        , 'query.IsLive'       : [ [ 'requiredWithout', 'query.JournalID' ], 'boolean' ] // not cleansed well, but it will work
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
    , [verb.list]              :
    {
      [method.get]             :
      {
          'query'                 : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'query.Page'            : [ 'required', 'integer', [ 'min', 1 ] ]
        , 'query.Limit'           : [ 'required', 'integer', [ 'min', 1 ] ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
    , [verb.create]        :
    {
      [method.post]      : 
      {
          'body'                  : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.AddressID'        : [ 'required', 'mongoId']
        , 'body.IsCOD'            : [ 'required', 'boolean' ]          
        , 'body.Longitude'        : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
        , 'body.Latitude'         : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
}
