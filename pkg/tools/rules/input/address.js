const { verb, method } = require('../../../system/models')

module.exports =
{
    [verb.add]                 :
    {
      [method.post]            : 
      {
          'body'                  : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.Longitude'        : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
        , 'body.Latitude'         : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
        , 'body.Tag'              : [ 'required', 'string', [ 'length', 30, 0 ] ]
        , 'body.IsDefault'        : [ 'required', 'boolean' ]
        , 'body.Line1'            : [ 'required', 'string', [ 'length', 200, 0 ] ]
        , 'body.Line2'            : [ 'required', 'string', [ 'length', 200, 0 ] ]
        , 'body.City'             : [ 'required', 'string', [ 'length', 200, 0 ] ]
        , 'body.PostalCode'       : [ 'required', 'integer' ]
        , 'body.State'            : [ 'required', 'string', [ 'length', 50, 2 ] ]
        , 'body.Country'          : [ 'required', 'string', [ 'length', 50, 2 ] ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
  , [verb.list]                :
    {
      [method.get]             :
      {
          'headers'               : [ 'required', 'object' ]            
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
  , [verb.view]                :
    {
      [method.get]             :
      {
          'query'              : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'query.AddressID'    : [ 'required', 'mongoId']
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
  , [verb.modify]              :
    {
      [method.post]            : 
      {
          'body'                  : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.AddressID'        : [ 'required', 'mongoId']
        , 'body.Longitude'        : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
        , 'body.Latitude'         : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
        , 'body.Tag'              : [ 'required', 'string', [ 'length', 30, 0 ] ]
        , 'body.IsDefault'        : [ 'required', 'boolean' ]
        , 'body.Line1'            : [ 'required', 'string', [ 'length', 200, 0 ] ]
        , 'body.Line2'            : [ 'required', 'string', [ 'length', 200, 0 ] ]
        , 'body.City'             : [ 'required', 'string', [ 'length', 200, 0 ] ]
        , 'body.PostalCode'       : [ 'required', 'integer' ]
        , 'body.State'            : [ 'required', 'string', [ 'length', 50, 2 ] ]
        , 'body.Country'          : [ 'required', 'string', [ 'length', 50, 2 ] ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]      
      }
    }
    , [verb.remove]            :
    {
      [method.delete]          : 
      {
          'body'               : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.AddressID'     : [ 'required', 'mongoId']    
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
  }
