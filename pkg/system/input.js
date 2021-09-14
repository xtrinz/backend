const {
        resource: rsrc, 
        verb,
        method,
        task,
        Err_,
        code, 
        reason,
        mode
      }             = require('../system/models')
    , { Validator } = require('node-input-validator')

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
          Body            :
          {
              Task        : [ 'required', 'string', [ 'in', task.New, task.ReadOTP, task.Register ] ]
            , MobileNo    : [ 'required' ]
            , Mode        : [ [ 'requiredIf', 'Task', task.New      ], 'string' , [ 'in', mode.User, mode.Agent, mode.Admin ] ]
            , Longitude   : [ [ 'requiredIf', 'Task', task.New      ], 'numeric', [ 'between', -180, 180 ] ]
            , Latitude    : [ [ 'requiredIf', 'Task', task.New      ], 'numeric', [ 'between', -90, 90 ] ]
            , OTP         : [ [ 'requiredIf', 'Task', task.ReadOTP  ], 'integer', [ 'between', 000000, 999999 ] ]
            , Name        : [ [ 'requiredIf', 'Task', task.Register ], 'string' , [ 'length', 50, 2 ] ]
            , Email       : [ [ 'requiredIf', 'Task', task.Register ], 'email' ]
          }
        }
      }
    , [verb.profile]      :
      {
          [method.put]    : 
          {
            Body          :
            {
                Name      : [ [ 'requiredWithout', 'Email' ] , 'string', [ 'length', 50, 2 ] ]
              , Email     : [ [ 'requiredWithout', 'Name'  ] , 'email' ]
            }
            , Head        : {} // TODO            
          }
        , [method.get]    : 
          {
              Head        : {} // TODO
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
            Task            : [ 'required', 'string', [ 'in', task.New, task.ReadOTP, task.Register ] ]
          , Name            : [ [ 'requiredIf', 'Task', task.New ], 'string' , [ 'length', 50, 2 ]  ]
          , Image           : [ [ 'requiredIf', 'Task', task.New ], 'string' , [ 'length', 200, 2 ] ]
          , Type            : [ [ 'requiredIf', 'Task', task.New ], 'string' ]
          , Certs           : [ [ 'requiredIf', 'Task', task.New ], 'string' ]
          , MobileNo        : ''
          , Email           : ''
          , Longitude       : ''
          , Latitude        : ''
          , Address         :
          {
                Line1       : ''
              , Line2       : ''
              , City        : ''
              , PostalCode  : ''
              , State       : ''
              , Country     : ''
          }    
          // Read OTP
          , Task            : ''
          , MobileNo        : ''
          , OTP             : ''
          
          // Approve
          , Task            : ''
          , StoreID         : ''
        }
      }
    , [verb.view]         :
      {
          [method.get]    : 
          {
              Query       : { StoreID       : '' }
            , Head        : { Authorization : '' }
          }                     
      }
    , [verb.list]         :
      {
          [method.get]    :
          {
             Query        :
            {
                Longitude : '17.20000'
              , Latitude  : '17.20000'
              , Page      : 1
              , Limit     : 8
            }
            , Header      : { Authorization : '' }            
          }                                         
      }
    , [verb.edit]         :
      {
          [method.put]    : 
          {
              Body        : 
            {
                Email     : ''
              , Image     : ''
              , Certs     : ''
              , Type      : ''
              , Name      : ''
              , Longitude : ''
              , Latitude  : '' 
            }
            , Head        : { Authorization : '' }            
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
              Body        : 
            {
                StoreID     : ''
              , Name        : ''
              , Image       : ''
              , Price       : ''
              , Quantity    : ''
              , Description : ''
              , CategoryID  : ''
            }
            , Head          : { Authorization: '' }
          }
      }
    , [verb.list]         :
      {
          [method.get]    :
          {
             Query        : 
            {
                  StoreID : ''
                , Page    : 1
                , Limit   : 8
            }
            , Head        : { Authorization: '' }
          }
      }
    , [verb.view]         :
      {
          [method.get]    : 
          {
              Query       : { ProductID : '' }
            , Header      : { Authorization: '' }
          }
      }
    , [verb.modify]       :
      {
          [method.post]   :
          {
              Body        : 
            {
                ProductID   : ''
              , Name        : ''
              , Image       : ''
              , Price       : 200
              , Quantity    : ''
              , Description : ''
              , CategoryID  : ''
            }
            , Head        : { Authorization: '' }            
          }
      }
    , [verb.remove]       :
      {
          [method.delete] : 
          {
              Body        : { ProductID : '' }
            , Head        : { Authorization: '' }
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
              Body        : 
            {             
                ProductID : ''
              , StoreID   : ''
              , Quantity  : ''
            }
            , Head        : { Authorization: '' }            
          }
      }
    , [verb.list]         :
      {
          [method.get]    : 
          {
              Body        : { AddressID : '' }
            , Head        : { Authorization: '' }
          }
      }
    , [verb.modify]       : 
      {
          [method.post]   : 
          {
              Body        : 
            {
                ProductID : ''
              , Quantity  : 5
            }
            , Head        : { Authorization: '' }            
          }
      }
    , [verb.remove]       :
      {
          [method.delete] : 
          {
              Body        : { ProductID   : '' }
            , Head        : { Authorization: '' }
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
              Body           : 
            {
                Longitude    : ''
              , Latitude     : ''
              , Tag          : ''
              , IsDefault    : ''
              , Address      :
              {
                  Name       : ''
                , Line1      : ''
                , Line2      : ''
                , City       : ''
                , PostalCode : ''
                , State      : ''
                , Country    : ''
              }
            }
            , Head           : { Authorization: '' }            
          }
      }
    , [verb.list]         :
      {
          [method.get]    : { Header : { Authorization: '' } }
      }
    , [verb.view]         :
      {
          [method.get]    : 
          {
              Query       : { AddressID : '' }                          
            , Head        : { Authorization: '' }            
          }
      }
    , [verb.modify]       :
      {
          [method.post]   : 
          {
              Body        : 
            {
                AddressID : ''
              , Longitude : ''
              , Latitude  : ''
              , Tag       : ''
              , IsDefault : false
              , Address   :
              {
                  Name       : ''
                , Line1      : ''
                , Line2      : ''
                , City       : ''
                , PostalCode : ''
                , State      : ''
                , Country    : ''
              }
            }
            , Head        : { Authorization: '' }            
          }
      }
    , [verb.remove]       :
      {
          [method.delete] : 
          {
              Body        : { AddressID : '' }                          
            , Head        : { Authorization: '' }
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
            Body         : 
          {                     
              Longitude  : ''
            , Latitude   : ''
            , AddressID  : ''
          }                     
          , Head         : { Authorization: '' }          
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
              Query       : { JournalID : '' }
            , Header      : { Authorization: '' }
          }
      }
    , [verb.view]         :
      {
          [method.get]    :
          {
              Query       : 
            {
                Page      : 1
              , Limit     : 8
            }
            , Header      : { Authorization: '' }            
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
          , Head          : { Authorization: '' }          
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
          , Head          : { Authorization: '' }          
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
          , Head          : { Authorization: '' }          
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
          , Head          : { Authorization: '' }          
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