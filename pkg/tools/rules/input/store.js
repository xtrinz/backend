const { verb, method, task, states } = require('../../../system/models')

module.exports =
{
    [verb.register]     :
    {
      [method.post]     :
      {
          'body'                    : [ 'required', 'object' ]
        , 'headers'                 : [ 'required', 'object' ]            
        , 'body.Task'               : [ 'required', 'string', [ 'in', task.New, task.ReadOTP, task.Register, task.Approve ] ]
        , 'body.MobileNo'           : [ [ 'requiredIf', 'body.Task', task.ReadOTP ],
                                        [ 'requiredIf', 'body.Task', task.New ],
                                        [ 'requiredIf', 'body.Task', task.Register], 'string', [ 'length', 15, 2 ] ] // [ 'regex', '/^+91[0-9]{10}$/' ]

        , 'body.OTP'                : [ [ 'requiredIf', 'body.Task', task.ReadOTP ], 'integer', [ 'between', 000000, 999999 ] ]

        , 'body.Name'               : [ [ 'requiredIf', 'body.Task', task.Register ], 'string' , [ 'length', 50, 2 ]  ]
        , 'body.Image'              : [ [ 'requiredIf', 'body.Task', task.Register ], 'string' , [ 'length', 200, 2 ] ]
        , 'body.Type'               : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 200, 0 ] ]
        , 'body.Certs'              : [ 'array' ]
        , 'body.Certs.*'            : [ 'string' ]
        , 'body.Email'              : [ [ 'requiredIf', 'body.Task', task.Register ], 'email' ]
        , 'body.Address'            : [ [ 'requiredIf', 'body.Task', task.Register ], 'object' ]
        , 'body.Address.Longitude'  : [ [ 'requiredIf', 'body.Task', task.Register ], 'numeric', [ 'between', -180, 180 ] ]
        , 'body.Address.Latitude'   : [ [ 'requiredIf', 'body.Task', task.Register ], 'numeric', [ 'between', -90, 90 ] ]        
        , 'body.Address.Line1'      : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 100, 2 ] ]
        , 'body.Address.Line2'      : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 100, 2 ] ]
        , 'body.Address.City'       : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 100, 2 ] ]
        , 'body.Address.PostalCode' : [ [ 'requiredIf', 'body.Task', task.Register ], 'integer' ]
        , 'body.Address.State'      : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 50, 2 ] ]
        , 'body.Address.Country'    : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 50, 2 ] ]
        , 'body.ClosingTime'        : [ [ 'requiredIf', 'body.Task', task.Register ], 'object' ]
        , 'body.ClosingTime.Hour'   : [ [ 'requiredIf', 'body.Task', task.Register ], 'integer', [ 'between', 0, 23 ] ]          
        , 'body.ClosingTime.Minute' : [ [ 'requiredIf', 'body.Task', task.Register ], 'integer', [ 'between', 0, 59 ] ]

        , 'body.StoreID'            : [ [ 'requiredIf', 'body.Task', task.Approve ], 'mongoId']
        , 'body.Action'             : [ [ 'requiredIf', 'body.Task', task.Approve ], 'string', [ 'in', task.Deny, task.Approve ]]
        , 'body.Text'               : [ 'string', [ 'length', 1000, 2 ] ]                    
        , 'headers.authorization'   : [ [ 'requiredIf', 'body.Task', task.Approve ], 'string', [ 'length', 500, 8 ] ]
      }
    }
  , [verb.view]                 :
    {
      [method.get]              : 
      {
          'body'                : [ 'required', 'object' ]
        , 'headers'                : [ 'required', 'object' ]
        , 'body.StoreID'        : [ [ 'requiredIf', 'body.Task', task.Approve ], 'mongoId']
        , 'headers.authorization'  : [ [ 'requiredIf', 'body.Task', task.Approve ], 'string', [ 'length', 500, 8 ] ]
      }                     
    }
  , [verb.list]                 :
    {
      [method.get]              :
      {
          'query'               : [ 'required', 'object' ]
        , 'headers'                : [ 'required', 'object' ]
        , 'query.Longitude'     : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
        , 'query.Latitude'      : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
        , 'query.Page'          : [ 'required', 'integer', [ 'min', 1 ] ]
        , 'query.Limit'         : [ 'required', 'integer', [ 'min', 1 ] ]
        , 'headers.authorization'  : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
  , [verb.edit]                 :
    {
        [method.put]            : 
        {
            'body'                    : [ 'required', 'object' ]
          , 'headers'                 : [ 'required', 'object' ]            
          , 'body.Name'               : [ 'string' , [ 'length', 50, 2 ]  ]
          , 'body.Image'              : [ 'string' , [ 'length', 200, 2 ] ]
          , 'body.Type'               : [ 'string', [ 'length', 200, 0 ] ]
          , 'body.Certs'              : [ 'array' ]
          , 'body.Certs.*'            : [ 'string' ]
          , 'body.Email'              : [ 'email' ]
          , 'body.Refeed'             : [ 'boolean' ]            
          , 'body.Address'            : [ 'object' ]
          , 'body.Address.Longitude'  : [ 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Address.Latitude'   : [ 'numeric', [ 'between', -90, 90 ] ]                  
          , 'body.Address.Line1'      : [ 'string', [ 'length', 200, 0 ] ]
          , 'body.Address.Line2'      : [ 'string', [ 'length', 200, 0 ] ]
          , 'body.Address.City'       : [ 'string', [ 'length', 200, 0 ] ]
          , 'body.Address.PostalCode' : [ 'integer' ]
          , 'body.Address.State'      : [ 'string', [ 'length', 50, 2 ] ]
          , 'body.Address.Country'    : [ 'string', [ 'length', 50, 2 ] ]  
          , 'body.ClosingTime'        : [ 'object' ]
          , 'body.ClosingTime.Hour'   : [ 'integer', [ 'between', 0, 23 ] ]          
          , 'body.ClosingTime.Minute' : [ 'integer', [ 'between', 0, 59 ] ]

          , 'body.Status'             : [ 'required', 'string', [ 'in', states.Running, states.Closed ] ]

          , 'headers.authorization'   : [ 'required', 'string', [ 'length', 500, 8 ] ]
        }                                         
    }
}