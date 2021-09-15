const {
        resource: rsrc, 
        verb,
        method,
        task,
        Err_,
        code, 
        reason,
        mode
      }                     = require('../system/models')
    , { Validator, extend } = require('node-input-validator')

    extend('startWith', ({ str, args }) => 
    {
      if (args.length !== 1)       return false
      if (str.startsWith(args[0])) return true
      return false
    })

// TODO body object
// head object

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
            'body.Task'        : [ 'required', 'string', [ 'in', task.New, task.ReadOTP, task.Register ] ]
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
              'body.Name'           : [ [ 'requiredWithout', 'Email' ] , 'string', [ 'length', 50, 2 ] ]
            , 'body.Email'          : [ [ 'requiredWithout', 'Name'  ] , 'email' ]
            , 'head..authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }
        , [method.get]    : 
          {
            'head..authorization'   : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          } 
      }                
    } // TODO rm verbs not needed

  // Store
  , [rsrc.store]          :
    {
      [verb.register]     :
      {
        [method.post]     :
        {
            'body.Task'               : [ 'required', 'string', [ 'in', task.New, task.ReadOTP, task.Approve ] ]
          , 'body.Name'               : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' , [ 'length', 50, 2 ]  ]
          , 'body.Image'              : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' , [ 'length', 200, 2 ] ]
          , 'body.Type'               : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' ]
          , 'body.Certs'              : [ [ 'requiredIf', 'body.Task', task.New     ], 'array' ]
          , 'body.Certs.*'            : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' ]
          , 'body.MobileNo'           : [ [ 'requiredIf', 'body.Task', task.ReadOTP ], [ 'requiredIf', 'body.Task', task.New ], 'string', 'regex:^+91[0-9]{10}$' ]
          , 'body.Email'              : [ [ 'requiredIf', 'body.Task', task.New     ], 'email' ]
          , 'body.Longitude'          : [ [ 'requiredIf', 'body.Task', task.New     ], 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'           : [ [ 'requiredIf', 'body.Task', task.New     ], 'numeric', [ 'between', -90, 90 ] ]
          , 'body.Address'            : [ [ 'requiredIf', 'body.Task', task.New     ], 'object' ]
          , 'body.Address.Line1'      : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' ]
          , 'body.Address.Line2'      : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' ]
          , 'body.Address.City'       : [ [ 'requiredIf', 'body.Task', task.New     ], 'string' ]
          , 'body.Address.PostalCode' : [ [ 'requiredIf', 'body.Task', task.New     ], 'integer' ]
          , 'body.Address.State'      : [ [ 'requiredIf', 'body.Task', task.New     ], 'string', [ 'in', 'Kerala' ] ]
          , 'body.Address.Country'    : [ [ 'requiredIf', 'body.Task', task.New     ], 'string', [ 'in', 'India' ] ]
          , 'body.OTP'                : [ [ 'requiredIf', 'body.Task', task.ReadOTP ], 'integer', [ 'between', 000000, 999999 ] ]
          , 'body.StoreID'            : [ [ 'requiredIf', 'body.Task', task.Approve ], 'mongoId']
          , 'head.authorization'      : [ [ 'requiredIf', 'body.Task', task.Approve ], 'string', [ 'startWith', 'Bearer ' ] ]
        }
      }
    , [verb.view]         :
      {
          [method.get]    : 
          {
              'body.StoreID'            : [ [ 'requiredIf', 'body.Task', task.Approve ], 'mongoId']
            , 'head.authorization'      : [ [ 'requiredIf', 'body.Task', task.Approve ], 'string', [ 'startWith', 'Bearer ' ] ]
          }                     
      }
    , [verb.list]         :
      {
          [method.get]    :
          {
              'query.Longitude'    : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
            , 'query.Latitude'     : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
            , 'query.Page'         : [ 'required', 'integer', [ 'min', 1 ] ]
            , 'query.Limit'        : [ 'required', 'integer', [ 'min', 1 ] ]
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }
      }
    , [verb.edit]         :
      {
          [method.put]    : 
          {
              'body.Name'               : [ 'string' , [ 'length', 50, 2 ]  ]
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
            , 'body.Address.State'      : [ 'string', [ 'in', 'Kerala' ] ]
            , 'body.Address.Country'    : [ 'string', [ 'in', 'India' ] ]
            , 'head.authorization'      : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }                                         
      }
    } // TODO move del verbs from user to store

  // Product
  , [rsrc.product]        :
    {
      [verb.add]          :
      {
          [method.post]   : 
          {
              'body.StoreID'       : [ 'required', 'mongoId'] // ?
            , 'body.Name'          : [ 'required', 'string' , [ 'length', 50, 2 ]  ]
            , 'body.Image'         : [ 'required', 'string' , [ 'length', 200, 2 ] ]
            , 'body.Price'         : [ 'required', 'integer', [ 'min', 1 ] ]            
            , 'body.Quantity'      : [ 'required', 'integer', [ 'min', 1 ] ]
            , 'body.Image'         : [ 'required', 'string' , [ 'length', 3000, 2 ] ]            
            , 'body.CategoryID'    : [ 'required', 'integer', [ 'min', 1 ] ]
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }      
      }
    , [verb.list]         :
      {
          [method.get]    :
          {
              'query.StoreID'      : [ 'required', 'mongoId'] // ?
            , 'query.Page'         : [ 'required', 'integer', [ 'min', 1 ] ]
            , 'query.Limit'        : [ 'required', 'integer', [ 'min', 1 ] ]
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }
      }
    , [verb.view]         :
      {
          [method.get]    : 
          {
              'query.ProductID'    : [ 'required', 'mongoId']
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]            
          }
      }
    , [verb.modify]       :
      {
          [method.post]   :
          {
              'body.ProductID'     : [ 'mongoId']
            , 'body.Name'          : [ 'string' , [ 'length', 50, 2 ]  ]
            , 'body.Image'         : [ 'string' , [ 'length', 200, 2 ] ]
            , 'body.Price'         : [ 'integer', [ 'min', 1 ] ]            
            , 'body.Quantity'      : [ 'integer', [ 'min', 1 ] ]
            , 'body.Image'         : [ 'string' , [ 'length', 3000, 2 ] ]            
            , 'body.CategoryID'    : [ 'integer', [ 'min', 1 ] ]
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]         
          }
      }
    , [verb.remove]       :
      {
          [method.delete] : 
          {
              'body.ProductID'     : [ 'required', 'mongoId']
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]  
          }
      }
    } // Correct authz

  // Cart
  , [rsrc.cart]           :
    {
      [verb.insert]       :
      {
          [method.post]   : 
          {
              'body.ProductID'     : [ 'required', 'mongoId']
            , 'body.StoreID'       : [ 'required', 'mongoId'] // ?
            , 'body.Quantity'      : [ 'integer', [ 'min', 1 ] ]
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]  
          }
      }
    , [verb.list]         :
      {
          [method.get]    : 
          {
              'body.AddressID'     : [ 'required', 'mongoId']
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]              
          }
      }
    , [verb.modify]       : 
      {
          [method.post]   : 
          {
              'body.ProductID'     : [ 'mongoId']
            , 'body.Quantity'      : [ 'integer', [ 'min', 1 ] ]
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }
      }
    , [verb.remove]       :
      {
          [method.delete] : 
          {
              'body.ProductID'     : [ 'mongoId']
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }
      }
    }

  // Address
  , [rsrc.address]        :
    {
      [verb.add]          :
      {
          [method.post]   : 
          {
              'body.Longitude'          : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
            , 'body.Latitude'           : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
            , 'body.Tag'                : [ 'required', 'string' ]
            , 'body.IsDefault'          : [ 'required', 'boolean' ]
            , 'body.Address'            : [ 'required', 'object' ]
            , 'body.Address.Line1'      : [ 'required', 'string' ]
            , 'body.Address.Line2'      : [ 'required', 'string' ]
            , 'body.Address.City'       : [ 'required', 'string' ]
            , 'body.Address.PostalCode' : [ 'required', 'integer' ]
            , 'body.Address.State'      : [ 'required', 'string', [ 'in', 'Kerala' ] ]
            , 'body.Address.Country'    : [ 'required', 'string', [ 'in', 'India' ] ]
            , 'head.authorization'      : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }
      }
    , [verb.list]         :
      {
          [method.get]    : 
          {
            'head.authorization'        : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }
      }
    , [verb.view]         :
      {
          [method.get]    : 
          {
                'query.AddressID'       : [ 'required', 'mongoId']
              , 'head.authorization'    : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }
      }
    , [verb.modify]       :
      {
          [method.post]   : 
          {
                'body.AddressID'          : [ 'required', 'mongoId']
              , 'body.Longitude'          : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
              , 'body.Latitude'           : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
              , 'body.Tag'                : [ 'required', 'string' ]
              , 'body.IsDefault'          : [ 'required', 'boolean' ]
              , 'body.Address'            : [ 'required', 'object' ]
              , 'body.Address.Line1'      : [ 'required', 'string' ]
              , 'body.Address.Line2'      : [ 'required', 'string' ]
              , 'body.Address.City'       : [ 'required', 'string' ]
              , 'body.Address.PostalCode' : [ 'required', 'integer' ]
              , 'body.Address.State'      : [ 'required', 'string', [ 'in', 'Kerala' ] ]
              , 'body.Address.Country'    : [ 'required', 'string', [ 'in', 'India' ] ]
              , 'head.authorization'      : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]      
          }
      }
    , [verb.remove]       :
      {
          [method.delete] : 
          {
                'body.AddressID'          : [ 'required', 'mongoId'] // TODO what if deleting default addr    
              , 'head.authorization'      : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }
      }
    }

  // Checkout
  , [rsrc.checkout]      : // TODO correct it root as rsrc and checkout as verb
    {
      [verb.root]        :
      {
        [method.post]    : 
        {
            'body.AddressID'     : [ 'required', 'mongoId']
          , 'body.Longitude'     : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'      : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
          , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
        }
      }
    }

  // Journal
  , [rsrc.journal]        :
    {
      [verb.list]         :
      {
          [method.get]    :
          {
              'query.JournalID'       : [ 'required', 'mongoId']
            , 'head.authorization'    : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
          }
      }
    , [verb.view]         :
      {
          [method.get]    :
          {
              'query.Page'         : [ 'required', 'integer', [ 'min', 1 ] ]
            , 'query.Limit'        : [ 'required', 'integer', [ 'min', 1 ] ]
            , 'head.authorization' : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ]
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
  , [rsrc.transit]        :
    {
      [verb.user]         :
      {
        [method.post]     : 
        {
           Body           : 
          {
              TransitID   : 'TransitID'
            , Task        : 'task.Cancel'
          }
          , Head          : { authorization : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ] }
        }
      }
    , [verb.store]        :
      {
        [method.post]     : 
        {
            Body          : 
          {
              TransitID   : 'TransitID'
            , Task        : 'task.Reject'

            , OTP         : staff.OTP
          }
          , Head          : { authorization : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ] }   
        }
      }
    , [verb.agent]        :
      {
        [method.post]     :
        {
            Body          : 
          {
              TransitID   : 'TransitID'
            , Task        : 'task.Reject'

            , OTP         : agent.OTP          
          }
          , Head          : { authorization : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ] }
        }        
      }
    , [verb.admin]        :
      {
        [method.post]     :
        {
            Body          : 
          {
              TransitID   : 'TransitID'
            , Task        : 'task.Reject'

            , MobileNo    : ''          
          }
          , Head          : { authorization : [ 'required', 'string', [ 'startWith', 'Bearer ' ] ] }    
        }                
      }
    }
/*  , [rsrc.root] :
    {
          // TODO
    }*/
	}

	, this.IsHonest = async (req, src, vrb, mthd) =>
	{
        const opt_ =
        { 
              Source  : src
            , Verb    : vrb
            , Method  : mthd
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
        
        if(rules.Body)
        {
          const v       = new Validator(req.body, rules.Body) // TODO add errors rules.Body
          const matched = await v.check()
          if(!matched)
          {
              console.log('iv-incorrect-input', { Opts: opt_, Methods: methods })            
              Err_(code.FORBIDDEN, reason.PermissionDenied)
          }
        }
    }
}

let x = new Controller()
let r = 
{
  body:
  {
      Task      : task.New
    , MobileNo  : '+91123456789'
    , Mode      : mode.Admin
    , Longitude : '17.12345'
    , Latitude  : '17.12345'    
  }
}
x.IsHonest(r, rsrc.user, verb.register, method.post)

module.exports =
{
	Controller : Controller
}