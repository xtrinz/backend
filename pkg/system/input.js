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
              Fields      :
            {
                Task      : [ 'required', 'string', [ 'in', task.New, task.ReadOTP, task.Register ] ]
              , MobileNo  : [ 'required' ] 
              , Mode      : [ 'required', 'string', [ 'in', mode.User, mode.Agent, mode.Admin ] ]
              , Longitude : [ 'required', 'numeric' ]
              , Latitude  : [ 'required', 'numeric' ]
            }
            , Err         :
            {
                Task      : 'Unknown Task'
              , MobileNo  : 'Invalid Mobile Number'
              , Mode      : 'Incorrect Mode'
              , Longitude : 'Incorrect Longitude'
              , Latitude  : 'Incorrect Latitude'
            }
          }
        }
      }
    , [verb.profile]      :
      {
          [method.put]    : {}
        , [method.get]    : {} 
      }                
    } // TODO rm verbs not needed

  // Store
  , [rsrc.store]          :
    {
      [verb.register]     :
      {
        [method.post]     : {}
      }
    , [verb.view]         :
      {
          [method.get]    : {}                     
      }
    , [verb.list]         :
      {
          [method.get]    : {}                                         
      }
    , [verb.edit]         :
      {
          [method.put]    : {}                                         
      }
    } // TODO move del verbs from user to store

  // Product
  , [rsrc.product]        :
    {
      [verb.add]          :
      {
          [method.post]   : {}
      }
    , [verb.list]         :
      {
          [method.get]    : {}
      }
    , [verb.view]         :
      {
          [method.get]    : {}
      }
    , [verb.modify]       :
      {
          [method.post]   : {}
      }
    , [verb.remove]       :
      {
          [method.delete] : {}
      }
    } // Correct authz

  // Cart
  , [rsrc.cart]           :
    {
      [verb.insert]       :
      {
          [method.post]   : {}
      }
    , [verb.list]         :
      {
          [method.get]    : {}
      }
    , [verb.modify]       : 
      {
          [method.post]   : {}
      }
    , [verb.remove]       :
      {
          [method.delete] : {}
      }
    }

  // Address
  , [rsrc.address]        :
    {
      [verb.add]          :
      {
          [method.post]   : {}
      }
    , [verb.list]         :
      {
          [method.get]    : {}
      }
    , [verb.view]         :
      {
          [method.get]    : {}
      }
    , [verb.modify]       :
      {
          [method.post]   : {}
      }
    , [verb.remove]       :
      {
          [method.delete] : {}
      }
    }

  // Checkout
  , [rsrc.checkout]      : // TODO correct it root as rsrc and checkout as verb
    {
      [verb.root]        :
      {
        [method.post]    : {}
      }
    }

  // Journal
  , [rsrc.journal]        :
    {
      [verb.list]         :
      {
          [method.get]    : {}
      }
    , [verb.view]         :
      {
          [method.get]    : {}
      }
    }

  // Transit
  , [rsrc.transit]        :
    {
      [verb.user]         :
      {
        [method.post]     : {}
      }
    , [verb.store]        :
      {
        [method.post]     : {}
      }
    , [verb.agent]        :
      {
        [method.post]     : {}
      }
    , [verb.admin]        :
      {
        [method.post]     : {}
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
          const v       = new Validator(req.body, rules.Body.Fields, rules.Body.Err)
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