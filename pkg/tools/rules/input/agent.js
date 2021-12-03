const {
    verb, method, 
    task, mode,
    states, qtype
  }         = require('../../../system/models')

module.exports = 
{
    [verb.register]     : 
    {
      [method.post]     : 
      {
          'body'                  : [ 'required', 'object' ]
        , 'body.Task'             : [ 'required', 'string', [ 'in', task.New, task.ReadOTP, task.Register, task.Approve ] ]
        , 'body.MobileNo'         : [ [ 'requiredIf', 'body.Task', task.ReadOTP ],
                                      [ 'requiredIf', 'body.Task', task.New ],
                                      [ 'requiredIf', 'body.Task', task.Register], 'string', [ 'length', 15, 2 ] ]
        , 'body.OTP'              : [ [ 'requiredIf', 'body.Task', task.ReadOTP  ], 'integer', [ 'between', 000000, 999999 ] ]
        , 'body.Name'             : [ [ 'requiredIf', 'body.Task', task.Register ], 'string' , [ 'length', 50, 2 ] ]
        , 'body.Email'            : [ 'email' ]
        , 'body.AgentID'          : [ [ 'requiredIf', 'body.Task', task.Approve ], 'mongoId']
        , 'body.Action'           : [ [ 'requiredIf', 'body.Task', task.Approve ], 'string', [ 'in', task.Deny, task.Approve ]]
        , 'body.Text'             : [ 'string', [ 'length', 1000, 2 ] ]
        , 'headers.authorization' : [ [ 'requiredIf', 'body.Task', task.Approve ], 'string', [ 'length', 500, 8 ] ]                                        
      }
    }
  , [verb.edit]      :
    {
        [method.put]    : 
        {
            'body'                  : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ] 
          , 'body.Name'             : [ [ 'requiredWithout', 'Email' ] , 'string', [ 'length', 50, 2 ] ]
          , 'body.Email'            : [ [ 'requiredWithout', 'Name'  ] , 'email' ]

          , 'body.Status'           : [ 'string', [ 'in', states.OnDuty, states.OffDuty ] ]

          , 'body.Longitude'        : [ [ 'requiredIf', 'body.Status', states.OnDuty ], 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'         : [ [ 'requiredIf', 'body.Status', states.OnDuty ], 'numeric', [ 'between', -90, 90 ] ]  
          , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
        }
    }
  , [verb.view]      :
    {
      [method.get]   : 
      {
          'headers'                 : [ 'required', 'object' ] 
        , 'headers.authorization'   : [ 'required', 'string', [ 'length', 500, 8 ] ]
      } 
    }  
    , [verb.list]                 :
    {
      [method.get]              :
      {
          'query'               : [ 'required', 'object' ]
        , 'headers'             : [ 'required', 'object' ]
        , 'query.SearchType'    : [ 'required', 'string', [ 'in', qtype.NearList, qtype.Pending, qtype.NearPending ] ]
        , 'query.Longitude'     : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
        , 'query.Latitude'      : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
        , 'query.Page'          : [ 'required', 'integer', [ 'min', 1 ] ]
        , 'query.Limit'         : [ 'required', 'integer', [ 'min', 1 ] ]
        , 'headers.authorization'  : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }                    
  }