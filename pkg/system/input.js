const {
        resource: rsrc, 
        verb,
        method,
        task,
        Err_,
        code, 
        reason,
        mode
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
          , 'body.Longitude'   : [ [ 'requiredIf', 'body.Task', task.New      ], 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'    : [ [ 'requiredIf', 'body.Task', task.New      ], 'numeric', [ 'between', -90, 90 ] ]
          , 'body.OTP'         : [ [ 'requiredIf', 'body.Task', task.ReadOTP  ], 'integer', [ 'between', 000000, 999999 ] ]
          , 'body.Name'        : [ [ 'requiredIf', 'body.Task', task.Register ], 'string' , [ 'length', 50, 2 ] ]
          , 'body.Email'       : [ [ 'requiredIf', 'body.Task', task.Register ], 'email' ]
        }
      }
    , [verb.profile]      :
      {
          [method.put]    : 
          {
              'body'                    : [ 'required', 'object' ]
            , 'headers'                 : [ 'required', 'object' ] 
            , 'body.Name'           : [ [ 'requiredWithout', 'Email' ] , 'string', [ 'length', 50, 2 ] ]
            , 'body.Email'          : [ [ 'requiredWithout', 'Name'  ] , 'email' ]
            , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
          }
        , [method.get]    : 
          {
            'headers'                 : [ 'required', 'object' ] 
          , 'headers.authorization'   : [ 'required', 'string', [ 'length', 500, 8 ] ]
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
          , 'body.Task'               : [ 'required', 'string', [ 'in', task.New, task.ReadOTP, task.Approve ] ]
          , 'body.Name'               : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' , [ 'length', 50, 2 ]  ]
          , 'body.Image'              : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' , [ 'length', 200, 2 ] ]
          , 'body.Type'               : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' ]
          , 'body.Certs'              : [ [ 'requiredIf', 'body.Task', task.New     ], 'array' ]
          , 'body.Certs.*'            : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' ]
          , 'body.MobileNo'           : [ [ 'requiredIf', 'body.Task', task.ReadOTP ], [ 'requiredIf', 'body.Task', task.New ], 'string', [ 'length', 15, 2 ] ] // [ 'regex', '/^+91[0-9]{10}$/' ]
          , 'body.Email'              : [ [ 'requiredIf', 'body.Task', task.New     ], 'email' ]
          , 'body.Longitude'          : [ [ 'requiredIf', 'body.Task', task.New     ], 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'           : [ [ 'requiredIf', 'body.Task', task.New     ], 'numeric', [ 'between', -90, 90 ] ]
          , 'body.Address'            : [ [ 'requiredIf', 'body.Task', task.New     ], 'object' ]
          , 'body.Address.Line1'      : [ [ 'requiredIf', 'body.Task', task.New     ], 'string', [ 'length', 100, 2 ] ]
          , 'body.Address.Line2'      : [ [ 'requiredIf', 'body.Task', task.New     ], 'string', [ 'length', 100, 2 ] ]
          , 'body.Address.City'       : [ [ 'requiredIf', 'body.Task', task.New     ], 'string', [ 'length', 100, 2 ] ]
          , 'body.Address.PostalCode' : [ [ 'requiredIf', 'body.Task', task.New     ], 'integer' ]
          , 'body.Address.State'      : [ [ 'requiredIf', 'body.Task', task.New     ], 'string', [ 'length', 50, 2 ] ]
          , 'body.Address.Country'    : [ [ 'requiredIf', 'body.Task', task.New     ], 'string', [ 'length', 50, 2 ] ]
          , 'body.OTP'                : [ [ 'requiredIf', 'body.Task', task.ReadOTP ], 'integer', [ 'between', 000000, 999999 ] ]
          , 'body.StoreID'            : [ [ 'requiredIf', 'body.Task', task.Approve ], 'mongoId']
          , 'headers.authorization'      : [ [ 'requiredIf', 'body.Task', task.Approve ], 'string', [ 'length', 500, 8 ] ]
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
            , 'headers'                    : [ 'required', 'object' ]            
            , 'body.Name'               : [ 'string' , [ 'length', 50, 2 ]  ]
            , 'body.Image'              : [ 'string' , [ 'length', 200, 2 ] ]
            , 'body.Type'               : [ 'string' ]
            , 'body.Certs'              : [ 'array' ]
            , 'body.Certs.*'            : [ 'string' ]
            , 'body.Email'              : [ 'email' ]
            , 'body.Longitude'          : [ 'numeric', [ 'between', -180, 180 ] ]
            , 'body.Latitude'           : [ 'numeric', [ 'between', -90, 90 ] ]
            , 'body.Address'            : [ 'object' ]
            , 'body.Address.Line1'      : [ 'string' ]
            , 'body.Address.Line2'      : [ 'string' ]
            , 'body.Address.City'       : [ 'string' ]
            , 'body.Address.PostalCode' : [ 'integer' ]
            , 'body.Address.State'      : [ 'string', [ 'length', 50, 2 ] ]
            , 'body.Address.Country'    : [ 'string', [ 'length', 50, 2 ] ]
            , 'headers.authorization'      : [ 'required', 'string', [ 'length', 500, 8 ] ]
          }                                         
      }
    } // TODO move del verbs from user to store

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
          , 'body.Quantity'      : [ 'required', 'integer', [ 'min', 1 ] ]
          , 'body.Image'         : [ 'required', 'string' , [ 'length', 3000, 2 ] ]            
          , 'body.CategoryID'    : [ 'required', 'integer', [ 'min', 1 ] ]
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
          , 'body.Quantity'      : [ 'integer', [ 'min', 1 ] ]
          , 'body.Image'         : [ 'string' , [ 'length', 3000, 2 ] ]            
          , 'body.CategoryID'    : [ 'integer', [ 'min', 1 ] ]
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
          , 'body.Quantity'      : [ 'integer', [ 'min', 1 ] ]
          , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]  
        }
      }
    , [verb.list]                :
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
            'body'               : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
          , 'body.ProductID'     : [ 'mongoId']
          , 'body.Quantity'      : [ 'integer', [ 'min', 1 ] ]
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
  , [rsrc.address]               :
    {
      [verb.add]                 :
      {
        [method.post]            : 
        {
            'body'                    : [ 'required', 'object' ]
          , 'headers'                    : [ 'required', 'object' ]            
          , 'body.Longitude'          : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'           : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
          , 'body.Tag'                : [ 'required', 'string' ]
          , 'body.IsDefault'          : [ 'required', 'boolean' ]
          , 'body.Address'            : [ 'required', 'object' ]
          , 'body.Address.Line1'      : [ 'required', 'string' ]
          , 'body.Address.Line2'      : [ 'required', 'string' ]
          , 'body.Address.City'       : [ 'required', 'string' ]
          , 'body.Address.PostalCode' : [ 'required', 'integer' ]
          , 'body.Address.State'      : [ 'required', 'string', [ 'length', 50, 2 ] ]
          , 'body.Address.Country'    : [ 'required', 'string', [ 'length', 50, 2 ] ]
          , 'headers.authorization'      : [ 'required', 'string', [ 'length', 500, 8 ] ]
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
            'body'                    : [ 'required', 'object' ]
          , 'headers'                    : [ 'required', 'object' ]            
          , 'body.AddressID'          : [ 'required', 'mongoId']
          , 'body.Longitude'          : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'           : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
          , 'body.Tag'                : [ 'required', 'string' ]
          , 'body.IsDefault'          : [ 'required', 'boolean' ]
          , 'body.Address'            : [ 'required', 'object' ]
          , 'body.Address.Line1'      : [ 'required', 'string' ]
          , 'body.Address.Line2'      : [ 'required', 'string' ]
          , 'body.Address.City'       : [ 'required', 'string' ]
          , 'body.Address.PostalCode' : [ 'required', 'integer' ]
          , 'body.Address.State'      : [ 'required', 'string', [ 'length', 50, 2 ] ]
          , 'body.Address.Country'    : [ 'required', 'string', [ 'length', 50, 2 ] ]
          , 'headers.authorization'      : [ 'required', 'string', [ 'length', 500, 8 ] ]      
        }
      }
      , [verb.remove]            :
      {
        [method.delete]          : 
        {
            'body'               : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
          , 'body.AddressID'     : [ 'required', 'mongoId'] // TODO what if deleting default addr    
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
          , 'headers'               : [ 'required', 'object' ]            
          , 'query.JournalID'    : [ 'required', 'mongoId']
          , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
        }
      }
      , [verb.list]              :
      {
        [method.get]             :
        {
            'query'              : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
          , 'query.Page'         : [ 'required', 'integer', [ 'min', 1 ] ]
          , 'query.Limit'        : [ 'required', 'integer', [ 'min', 1 ] ]
          , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
        }
      }
    }
/**
 *         , Body   : 
        {
            ORDERID      : cart.Paytm.OrderID
          , TXNID        : cart.Paytm.OrderID
          , TXNDATE      : String(Date.now())
          , STATUS       : paytm.TxnSuccess
          , BANKTXNID    : cart.Paytm.OrderID
          , MID          : cart.Paytm.MID
          , TXNAMOUNT    : cart.Paytm.Amount
          , CHECKSUMHASH : '--pre-set--'
        }


 */
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
/*  , [rsrc.root] :
    {
          // TODO
    }*/
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