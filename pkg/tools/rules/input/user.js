const { verb, method, task, mode } = require('../../../system/models')

module.exports =
{
    [verb.register]     : 
    {
      [method.post]     : 
      {
          'body'             : [ 'required', 'object' ]
        , 'body.Task'        : [ 'required', 'string', [ 'in', task.New, task.ReadOTP, task.Register ] ]
        , 'body.MobileNo'    : [ 'required' ]
        , 'body.Mode'        : [ [ 'requiredIf', 'body.Task', task.New      ], 'string' , [ 'in', mode.User, mode.Agent, mode.Admin ] ]
        , 'body.OTP'         : [ [ 'requiredIf', 'body.Task', task.ReadOTP  ], 'integer', [ 'between', 000000, 999999 ] ]
        , 'body.Name'        : [ [ 'requiredIf', 'body.Task', task.Register ], 'string' , [ 'length', 50, 2 ] ]
        , 'body.Email'       : [ 'email' ]
      }
    }
  , [verb.profile]      :
    {
        [method.put]    : 
        {
            'body'                  : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ] 
          , 'body.Name'             : [ [ 'requiredWithout', 'Email' ] , 'string', [ 'length', 50, 2 ] ]
          , 'body.Email'            : [ [ 'requiredWithout', 'Name'  ] , 'email' ]
          , 'body.Longitude'        : [ 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'         : [ 'numeric', [ 'between', -90, 90 ] ]  
          , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
        }
      , [method.get]    : 
        {
          'headers'                 : [ 'required', 'object' ] 
        , 'headers.authorization'   : [ 'required', 'string', [ 'length', 500, 8 ] ]
        } 
    }                
  }