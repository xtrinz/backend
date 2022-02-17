const { verb, method } = require('../../../sys/models')

module.exports =
{
    [verb.add]                 :
    {
      [method.post]            : 
      {
          'body'               : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.SellerID'       : [ 'required', 'mongoId'] // ?
        , 'body.Name'          : [ 'required', 'string' , [ 'length', 50, 2 ]  ]
        , 'body.Image'         : [ 'required', 'string' , [ 'length', 200, 2 ] ]
        , 'body.Price'         : [ 'required', 'integer', [ 'min', 1 ] ]    
        , 'body.HasCOD'        : [ 'required', 'boolean' ]
        , 'body.Quantity'      : [ 'required', 'integer', [ 'min', -50 ], [ 'max', 50 ] ]
        , 'body.Image'         : [ 'required', 'string' , [ 'length', 3000, 2 ] ]            
        , 'body.Category'      : [ 'required', 'string',  [ 'length', 50, 2 ] ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }      
    }
  , [verb.list]                :
    {
      [method.get]             :
      {
          'query'              : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'query.SellerID'      : [ 'required', 'mongoId'] // ?
        , 'query.Page'         : [ 'required', 'integer', [ 'min', 1 ] ]
        , 'query.Limit'        : [ 'required', 'integer', [ 'min', 1 ] ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
  , [verb.view]                :
    {
      [method.get]             : 
      {
          'query.ProductID'    : [ 'required', 'mongoId']
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]            
      }
    }
  , [verb.modify]              :
    {
      [method.put]            :
      {
          'body'               : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.ProductID'     : [ 'mongoId']
        , 'body.Name'          : [ 'string' , [ 'length', 50, 2 ]  ]
        , 'body.HasCOD'        : [ 'boolean' ]
        , 'body.Image'         : [ 'string' , [ 'length', 200, 2 ] ]
        , 'body.Price'         : [ 'integer', [ 'min', 1 ] ]            
        , 'body.Quantity'      : [ 'integer', [ 'min', -50 ], [ 'max', 50 ] ]
        , 'body.Image'         : [ 'string' , [ 'length', 3000, 2 ] ]            
        , 'body.Category'      : [ 'required', 'string',  [ 'length', 50, 2 ] ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]         
      }
    }
  , [verb.remove]              :
    {
      [method.delete]          : 
      {
          'body'               : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.ProductID'     : [ 'required', 'mongoId']
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]  
      }
    }
  }