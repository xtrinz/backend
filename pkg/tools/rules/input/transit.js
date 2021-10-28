const { verb, method, task } = require('../../../system/models')

module.exports =
{
    [verb.user]                  :
    {
      [method.post]              : 
      {   
             'body'              : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
          , 'body.TransitID'     : [ 'required', 'mongoId']
          , 'body.Task'          : [ 'required', 'string', [ 'in', task.Cancel ] ]
          , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
  , [verb.store]               :
    {
      [method.post]            : 
      {
          'body'               : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.TransitID'     : [ 'required', 'mongoId']
        , 'body.Task'          : [ 'required', 'string', [ 'in', task.Reject, task.Accept, task.Despatch ] ]
        , 'body.OTP'           : [ [ 'requiredIf', 'body.Task', task.Despatch ], 'integer', [ 'between', 000000, 999999 ] ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]

      }
    }
  , [verb.agent]               :
    {
      [method.post]            :
      {
          'body'               : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.TransitID'     : [ 'required', 'mongoId']
        , 'body.Task'          : [ 'required', 'string', [ 'in', task.ResendOTP, task.Reject, task.Ignore, task.Accept, task.Complete ] ]
        , 'body.OTP'           : [ [ 'requiredIf', 'body.Task', task.Completes ], 'integer', [ 'between', 000000, 999999 ] ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }        
    }
  , [verb.admin]               :
    {
      [method.post]            :
      {
          'body'               : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]            
        , 'body.TransitID'     : [ 'required', 'mongoId']
        , 'body.Task'          : [ 'required', 'string', [ 'in', task.Accept, task.Assign, task.Termiate ] ]
        , 'body.MobileNo'      : [ [ 'requiredIf', 'body.Task', task.Assign ], 'string' ] // [ 'regex', '/^+91[0-9]{10}$/' ]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }                
    }
  }