const {
        resource: rsrc, 
        verb,
        method,
        Err_,
        code, 
        reason
      }       = require('../system/models')

//      required|email|minLength:5|maxLength:15|

//      new Validator(req.body, {})

const Controller 		 = function()
{
	this.Controller =
	{
    // User
    [rsrc.user]           :
    {
      [verb.register]     : 
      {
        [method.post]     : {}
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

	, this.IsHonest = async (src, vrb, mthd) =>
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

        const validator     = methods[mthd]
        if(!validator)
        {
            console.log('iv-method-not-found', { Opts: opt_, Methods: methods })
            Err_(code.FORBIDDEN, reason.PermissionDenied)
        }

        const matched = await validator.check()
        if(!matched)
        {
            console.log('iv-incorrect-input', { Opts: opt_, Methods: methods })            
            Err_(code.FORBIDDEN, reason.PermissionDenied)
        }
    }
}

module.exports =
{
	Controller : Controller
}