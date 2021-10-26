const {
        resource: rsrc, 
        verb,
        method,
        task,
        Err_,
        code, 
        reason,
        mode,
        paytm,
        note,
        states,
        qtype
      }               = require('../system/models')
    , niv             = require('node-input-validator')


const Controller 		 = function()
{
	this.Controller =
	{
    // User
    [rsrc.user]           :
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

    // Agent
  , [rsrc.agent]           :
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
          , 'body.Mode'             : [ [ 'requiredIf', 'body.Task', task.New      ], 'string' , [ 'in', mode.User, mode.Agent, mode.Admin ] ]
          , 'body.OTP'              : [ [ 'requiredIf', 'body.Task', task.ReadOTP  ], 'integer', [ 'between', 000000, 999999 ] ]
          , 'body.Name'             : [ [ 'requiredIf', 'body.Task', task.Register ], 'string' , [ 'length', 50, 2 ] ]
          , 'body.Email'            : [ 'email' ]
          , 'body.AgentID'          : [ [ 'requiredIf', 'body.Task', task.Approve ], 'mongoId']
          , 'body.Action'           : [ [ 'requiredIf', 'body.Task', task.Approve ], 'string', [ 'in', task.Deny, task.Approve ]]
          , 'body.Text'             : [ 'string', [ 'length', 1000, 2 ] ]
          , 'headers.authorization' : [ [ 'requiredIf', 'body.Task', task.Approve ], 'string', [ 'length', 500, 8 ] ]                                        
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

  // Store
  , [rsrc.store]          :
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
          , 'body.Certs'              : [ [ 'requiredIf', 'body.Task', task.Register ], 'array' ]
          , 'body.Certs.*'            : [ [ 'requiredIf', 'body.Task', task.Register ], 'string' ]
          , 'body.Email'              : [ [ 'requiredIf', 'body.Task', task.Register ], 'email' ]
          , 'body.Longitude'          : [ [ 'requiredIf', 'body.Task', task.Register ], 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'           : [ [ 'requiredIf', 'body.Task', task.Register ], 'numeric', [ 'between', -90, 90 ] ]
          , 'body.Address'            : [ [ 'requiredIf', 'body.Task', task.Register ], 'object' ]
          , 'body.Address.Line1'      : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 100, 2 ] ]
          , 'body.Address.Line2'      : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 100, 2 ] ]
          , 'body.Address.City'       : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 100, 2 ] ]
          , 'body.Address.PostalCode' : [ [ 'requiredIf', 'body.Task', task.Register ], 'integer' ]
          , 'body.Address.State'      : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 50, 2 ] ]
          , 'body.Address.Country'    : [ [ 'requiredIf', 'body.Task', task.Register ], 'string', [ 'length', 50, 2 ] ]
          , 'body.Time'               : [ [ 'requiredIf', 'body.Task', task.Register ], 'object' ]
          , 'body.Time.Open'          : [ [ 'requiredIf', 'body.Task', task.Register ], 'object' ]          
          , 'body.Time.Close'         : [ [ 'requiredIf', 'body.Task', task.Register ], 'object' ]
          , 'body.Time.Open.Hour'     : [ [ 'requiredIf', 'body.Task', task.Register ], 'integer', [ 'between', 0, 23 ] ]          
          , 'body.Time.Open.Minute'   : [ [ 'requiredIf', 'body.Task', task.Register ], 'integer', [ 'between', 0, 59 ] ]
          , 'body.Time.Close.Hour'    : [ [ 'requiredIf', 'body.Task', task.Register ], 'integer', [ 'between', 0, 23 ] ]
          , 'body.Time.Close.Minute'  : [ [ 'requiredIf', 'body.Task', task.Register ], 'integer', [ 'between', 0, 59 ] ]

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
            , 'body.Longitude'          : [ 'numeric', [ 'between', -180, 180 ] ]
            , 'body.Latitude'           : [ 'numeric', [ 'between', -90, 90 ] ]
            , 'body.Address'            : [ 'object' ]
            , 'body.Address.Line1'      : [ 'string', [ 'length', 200, 0 ] ]
            , 'body.Address.Line2'      : [ 'string', [ 'length', 200, 0 ] ]
            , 'body.Address.City'       : [ 'string', [ 'length', 200, 0 ] ]
            , 'body.Address.PostalCode' : [ 'integer' ]
            , 'body.Address.State'      : [ 'string', [ 'length', 50, 2 ] ]
            , 'body.Address.Country'    : [ 'string', [ 'length', 50, 2 ] ]

            , 'body.Time'               : [ 'object' ]
            , 'body.Time.Open'          : [ 'object' ]          
            , 'body.Time.Close'         : [ 'object' ]
            , 'body.Time.Open.Hour'     : [ 'integer', [ 'between', 0, 23 ] ]          
            , 'body.Time.Open.Minute'   : [ 'integer', [ 'between', 0, 59 ] ]
            , 'body.Time.Close.Hour'    : [ 'integer', [ 'between', 0, 23 ] ]
            , 'body.Time.Close.Minute'  : [ 'integer', [ 'between', 0, 59 ] ]

            , 'body.Status'             : [ 'required', 'string', [ 'in', states.Running, states.Closed ] ]

            , 'headers.authorization'   : [ 'required', 'string', [ 'length', 500, 8 ] ]
          }                                         
      }
    }

  // Product
  , [rsrc.product]               :
    {
      [verb.add]                 :
      {
        [method.post]            : 
        {
            'body'               : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
          , 'body.StoreID'       : [ 'required', 'mongoId'] // ?
          , 'body.Name'          : [ 'required', 'string' , [ 'length', 50, 2 ]  ]
          , 'body.Image'         : [ 'required', 'string' , [ 'length', 200, 2 ] ]
          , 'body.Price'         : [ 'required', 'integer', [ 'min', 1 ] ]            
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
          , 'query.StoreID'      : [ 'required', 'mongoId'] // ?
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
        [method.post]            :
        {
            'body'               : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
          , 'body.ProductID'     : [ 'mongoId']
          , 'body.Name'          : [ 'string' , [ 'length', 50, 2 ]  ]
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
    } // Correct authz

  // Cart
  , [rsrc.cart]                  :
    {
      [verb.insert]              :
      {
        [method.post]            : 
        {
            'body'               : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
          , 'body.ProductID'     : [ 'required', 'mongoId']
          , 'body.StoreID'       : [ 'required', 'mongoId'] // ?
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
            'body'               : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
          , 'body.ProductID'     : [ 'mongoId']
          , 'body.Quantity'      : [ 'integer', [ 'min', -50 ], [ 'max', 50 ] ]
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

  // Address
  , [rsrc.note]               :
    {
      [verb.view]                :
      {
        [method.get]             :
        {
            'query'                 : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]
          , 'query.Type'            : [ 'required', 'string', [ 'in', note.Terms, note.Policy, note.Help ]]
          , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
        }
      }
    , [verb.set]              :
      {
        [method.post]            : 
        {
            'body'                  : [ 'required', 'object' ]

          , 'body.Type'             : [ 'required', 'string', [ 'in', note.Terms, note.Policy, note.Help ]]
          , 'body.Body'             : [ 'required', 'string' ]

          , 'headers'               : [ 'required', 'object' ]            
          , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]      
        }
      }
    }



  // Address
  , [rsrc.address]               :
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

  // Checkout
  , [rsrc.checkout]              : // TODO correct it root as rsrc and checkout as verb
    {
      [verb.root]                :
      {
        [method.post]            : 
        {
            'body'               : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
          , 'body.AddressID'     : [ 'required', 'mongoId']
          , 'body.Longitude'     : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'      : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
          , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
        }
      }
    }

  // Journal
  , [rsrc.journal]               :
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
    }

  // Transit
  , [rsrc.paytm]                 :
    {
      [verb.payment]             :
      {
        [method.post]            : 
        {
            'body'               : [ 'required', 'object' ]          
          , 'body.ORDERID'       : [ 'required', 'string', [ 'length', 30, 30 ] ]
          , 'body.TXNID'         : [ 'required', 'string' ]
          , 'body.TXNDATE'       : [ 'required', 'string' ]
          , 'body.STATUS'        : [ 'required', 'string', [ 'in', paytm.TxnSuccess, paytm.TxnFailure, paytm.TxnPending ] ]
          , 'body.BANKTXNID'     : [ 'required', 'string' ]
          , 'body.MID'           : [ 'required', 'string', [ 'in', process.env.PAYTM_MID ] ]
          , 'body.TXNAMOUNT'     : [ 'required', 'numeric', [ 'min', 1 ] ]
          , 'body.CHECKSUMHASH'  : [ 'required', 'string' ] // LEN
        }
      }
      , [verb.refund]           :
      {
        [method.post]           : 
        {
            'body'              : [ 'required', 'object' ]  
          , 'headers'           : [ 'required', 'object' ]
        }
      }      
    }

  // Socket
  , [rsrc.socket]                 :
    {
      [verb.connect]             :
      {
        [method.void]            : 
        {
            'handshake'            : [ 'required', 'object' ]
          , 'handshake.auth'       : [ 'required', 'object' ]
          , 'handshake.auth.Token' : [ 'required', 'string', [ 'length', 500, 8 ] ]                                  
          , 'id'                   : [ 'required', 'string', [ 'length', 100, 1 ] ]
        }
      }
      , [verb.disconnect]          :
      {
        [method.void]              : 
        {
            'id'                   : [ 'required', 'string', [ 'length', 100, 1 ] ]
        }
      }      
    }

  // Transit
  , [rsrc.transit]                 :
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
	}

  , this.SetErr   = (rules) =>
  {
    const err_ =
    {
        required  : ''
      , object    : ''
      , mongoId   : ''
      , string    : ''
      , in        : ''
      , requiredIf: ''
      , integer   : ''
      , startWith : ''
      , between   : ''
      , min       : ''
      , numeric   : ''
      , length    : ''
      , email     : ''
      , regex     : ''
    }
    return {}
  }

	, this.IsHonest = async (req, src, vrb, mthd) =>
	{
        const opt_ =
        { 
              Source  : src
            , Verb    : vrb
            , Method  : mthd
            , Body    : req.body
            , Head    : req.headers
            , Query   : req.query
            , Params  : req.params
        }
        
        console.log('iv-new-query', opt_)
        const verbs   = this.Controller[src]
        if(!verbs)
        {
            console.log('iv-resouce-not-found', opt_)
            Err_(code.FORBIDDEN, reason.PermissionDenied)
        }

        const methods = verbs[vrb]
        if(!methods)
        {
            console.log('iv-verb-not-found', { Opts: opt_, Verb: verbs })
            Err_(code.FORBIDDEN, reason.PermissionDenied)
        }

        const rules     = methods[mthd]
        if(!rules)
        {
            console.log('iv-method-not-found', { Opts: opt_, Methods: methods })
            Err_(code.FORBIDDEN, reason.PermissionDenied)
        }

        const err_    = this.SetErr(rules)

        const v       = new niv.Validator(req, rules) // TODO add errors rules.Body
        const matched = await v.check()
        if(!matched)
        {
            console.log('iv-incorrect-input', { Opts: opt_, Rule: rules, Err: v.errors })
            Err_(code.FORBIDDEN, reason.PermissionDenied)
        }      
    }
}

module.exports =
{
	Controller : Controller
}