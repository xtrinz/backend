const { verb, method } = require('../../../sys/models')
    , Model            = require('../../../sys/models')

module.exports =
{
    [verb.view]                :
    {
      [method.get]             :
      {
          'query'                 : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]
        , 'query.JournalID'       : [ 'required', 'mongoId']
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
    , [verb.list]              :
    {
      [method.get]             :
      {
          'query'                 : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]
        , 'query.Page'            : [ 'required', 'integer' , [ 'min', 1 ] ]
        , 'query.Limit'           : [ 'required', 'integer' , [ 'min', 1 ] ]
        , 'query.SellerUID'       : [ 'string'  , [ 'length', 15, 2 ] ]
        , 'query.ClientUID'       : [ 'string'  , [ 'length', 15, 2 ] ]
        , 'query.AgentUID'        : [ 'string'  , [ 'length', 15, 2 ] ]
        , 'query.ArbiterUID'      : [ 'string'  , [ 'length', 15, 2 ] ]        
        , 'query.PaymentStatus'   : [ 'string'  , [ 'length', 15, 2 ], [ 'in', Model.status.Success    , Model.status.Failed  , Model.status.Pending ] ]
        , 'query.TransitStatus'   : [ 'string'  , [ 'length', 15, 2 ], [ 'in', Model.states.Running    , Model.states.Closed   ] ]
        , 'query.TransitState'    : [ 'string'  , [ 'length', 15, 2 ], [ 'in', Model.states.Pending    , Model.states.Initiated  
                                                                             , Model.states.Cancelled  , Model.states.Rejected
                                                                             , Model.states.Despatched , Model.states.Assigned   
                                                                             , Model.states.OnHold     , Model.states.Assigned
                                                                             , Model.states.OnHold     , Model.states.Despatched 
                                                                             , Model.states.Accepted   , Model.states.Terminated
                                                                             , Model.states.Accepted   , Model.states.OnHold
                                                                             , Model.states.Completed ]]
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
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
}
