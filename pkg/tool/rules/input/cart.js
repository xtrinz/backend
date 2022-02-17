const { verb, method } = require('../../../sys/models')

module.exports =
{
    [verb.insert]              :
    {
      [method.post]            : 
      {
          'body'               : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.ProductID'     : [ 'required', 'mongoId']
        , 'body.SellerID'       : [ 'required', 'mongoId'] // ?
        , 'body.Quantity'      : [ 'integer', [ 'min', -50 ], [ 'max', 50 ] ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]  
      }
    }
  , [verb.list]                :
    {
      [method.get]             : 
      {
          'query'              : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'query.AddressID'    : [ 'mongoId']
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]              
      }
    }
  , [verb.modify]              : 
    {
      [method.post]            : 
      {
          'body'                  : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.ProductID'        : [ 'required', 'mongoId']
        , 'body.IsInc'            : [ 'required', 'boolean' ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
  , [verb.remove]              :
    {
      [method.delete]          : 
      {
          'body'               : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.ProductID'     : [ 'mongoId']
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
  }