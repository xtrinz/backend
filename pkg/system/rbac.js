const {
        resource: rsrc, 
        verb,
        task,
        method,
        mode,
        states,
        Err_,
        code, 
        reason
      }       = require('../system/models')

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
          [task.New]      : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin]  : true
          , [mode.Enabled]: false
          }
        , [task.ReadOTP]  : 
        { 
            [mode.User]   : true
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: true
          , [mode.Enabled]: false
        }
        , [task.Register] : 
        { 
            [mode.User]   : true
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: true
          , [mode.Enabled]: true
          , [states.State]: [ states.MobConfirmed ]
        }
        , [task.Enabled] : true        
        }
      }
    , [verb.profile]      :
      {
          [method.put]    : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: true
          , [mode.Enabled]: true
          , [task.Enabled]: false                    
          }
        , [method.get]    : 
        { 
          [mode.User]     : true
        , [mode.Agent]    : true
        , [mode.Store]    : false
        , [mode.Admin] 	  : true
        , [mode.Enabled]  : true
        , [task.Enabled]  : false        
        } 
      }                
    }

    // Agent
    , [rsrc.agent]        :
    {
      [verb.register]     : 
      {
        [method.post]     : 
        { 
          [task.New]      : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin]  : false
          , [mode.Enabled]: false
          }
        , [task.ReadOTP]  : 
        { 
            [mode.User]   : false
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: false
        }
        , [task.Register] : 
        { 
            [mode.User]   : false
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [states.State]: [ states.MobConfirmed ]
        }
        , [task.Approve]  : 
        { 
          [mode.User]     : false
        , [mode.Agent]    : false
        , [mode.Store]    : false
        , [mode.Admin] 	  : true
        , [mode.Enabled]  : true
        }        
        , [task.Enabled] : true        
        }
      }
    , [verb.profile]      :
      {
          [method.put]    : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled]: false    
          , [states.State]: [ states.ToBeApproved
                            , states.Registered
                            , states.ToBeCorrected ]               
          }
      }    
      , [verb.view]      :      
      {
          [method.get]    : 
        { 
          [mode.User]     : false
        , [mode.Agent]    : true
        , [mode.Store]    : false
        , [mode.Admin] 	  : false
        , [mode.Enabled]  : true
        , [task.Enabled]  : false        
        }         
      }            
      , [verb.list]      :      
      {
          [method.get]    : 
        { 
          [mode.User]     : false
        , [mode.Agent]    : false
        , [mode.Store]    : false
        , [mode.Admin] 	  : true
        , [mode.Enabled]  : true
        , [task.Enabled]  : false        
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
          [task.New]      : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: false
          , [mode.Enabled]: false
          }
        , [task.ReadOTP]  : 
        { 
          [mode.User]     : false
        , [mode.Agent]    : false
        , [mode.Store]    : true
        , [mode.Admin] 	  : false
        , [mode.Enabled]  : false
        }
        , [task.Register] : 
        { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [states.State]: [ states.MobConfirmed ]
        }
        , [task.Approve]  : 
        { 
          [mode.User]     : false
        , [mode.Agent]    : false
        , [mode.Store]    : false
        , [mode.Admin] 	  : true
        , [mode.Enabled]  : true
        }
        , [task.Enabled] : true        
        }                    
      }
    , [verb.view]         :
      {
          [method.get]    : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: true
          , [mode.Enabled]: true
          , [task.Enabled]: false          
          }                     
      }
    , [verb.list]         :
      {
          [method.get]    : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: true
          , [mode.Enabled]: true
          , [task.Enabled]: false          
          }                                         
      }
    , [verb.edit]         :
      {
          [method.put]    : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled]: false
          , [states.State]: [ states.ToBeApproved
                            , states.Registered
                            , states.ToBeCorrected ]
          }                                         
      }
    }

  // Product
  , [rsrc.product]        :
    {
      [verb.add]          :
      {
          [method.post]   : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.list]         :
      {
          [method.get]    : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: true
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.view]         :
      {
          [method.get]    : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: true
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.modify]       :
      {
          [method.post]   : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.remove]       :
      {
          [method.delete] : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
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
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.list]         :
      {
          [method.get]    : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.modify]       : 
      {
          [method.post]   : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.remove]       :
      {
          [method.delete] : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
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
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.list]         :
      {
          [method.get]    : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.view]         :
      {
          [method.get]    : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.modify]       :
      {
          [method.post]   : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.remove]       :
      {
          [method.delete] : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          , [task.Enabled] : false          
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
          [mode.User]    : true
        , [mode.Agent]   : false
        , [mode.Store]   : false
        , [mode.Admin] 	 : false
        , [mode.Enabled] : true
        , [task.Enabled] : false
        }
      }
    }

    // Cloudinary Sign
  , [rsrc.cloudinary]    : // TODO correct it root as rsrc and checkout as verb
    {
      [verb.root]        :
      {
        [method.post]    :
        {
          [mode.User]    : false
        , [mode.Agent]   : false
        , [mode.Store]   : true
        , [mode.Admin] 	 : false
        , [mode.Enabled] : true
        , [task.Enabled] : false
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
            [mode.User]   : true
          , [mode.Agent]  : true
          , [mode.Store]  : true
          , [mode.Admin] 	: true
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    , [verb.view]         :
      {
          [method.get]    : 
          {
            [mode.User]   : true
          , [mode.Agent]  : true
          , [mode.Store]  : true
          , [mode.Admin]  : true
          , [mode.Enabled]: true
          , [task.Enabled] : false          
          }
      }
    }

  // Transit
  , [rsrc.transit]        :
    {
      [verb.user]         :
      {
        [method.post]     : 
        {
            [task.Cancel] : 
          { 
            [mode.User]   : true
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          }
          , [task.Enabled] : true          
        }
      }
    , [verb.store]        :
      {
        [method.post]     :
        {
            [task.Reject] : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          }
          , [task.Accept] : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          }
          , [task.Despatch] : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : true
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          }
          , [task.Enabled] : true          
        }
      }
    , [verb.agent]        :
      {
        [method.post]     : 
        { 
          [task.ResendOTP]: 
          {
            [mode.User]   : false
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          }
          , [task.Reject] : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          }
          , [task.Ignore] : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          }
          , [task.Accept] : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          }
          , [task.Complete] : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : true
          , [mode.Store]  : false
          , [mode.Admin] 	: false
          , [mode.Enabled]: true
          }
          , [task.Enabled] : true          
        }
      }
    , [verb.admin]        :
      {
        [method.post]     : 
        { 
          [task.Accept]   : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: true
          , [mode.Enabled]: true
          }
          , [task.Assign] : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: true
          , [mode.Enabled]: true
          }
          , [task.Termiate] : 
          { 
            [mode.User]   : false
          , [mode.Agent]  : false
          , [mode.Store]  : false
          , [mode.Admin] 	: true
          , [mode.Enabled]: true
          }
          , [task.Enabled] : true
        }
      }
    }
	}

	, this.HasAccess = (src, vrb, mthd, tsk) =>
	{
    const opt_ =
    { 
        Source  : src
      , Verb    : vrb
      , Method  : mthd
      , Task    : tsk
    }
    console.log('new-query', opt_)
    const verbs   = this.Controller[src]
    if(!verbs)
    {
      console.log('resouce-not-found', opt_)
      Err_(code.FORBIDDEN, reason.PermissionDenied)
    }
    const methods = verbs[vrb]
    if(!methods)
    {
      console.log('verb-not-found', { Opts: opt_, Verb: verbs })
      Err_(code.FORBIDDEN, reason.PermissionDenied)
    }
    const res     = methods[mthd]
    if(!res)
    {
      console.log('method-not-found', { Opts: opt_, Methods: methods })
      Err_(code.FORBIDDEN, reason.PermissionDenied)
    }

    if(!res[task.Enabled]) 
    {
      
      if(!res[states.State]) 
      res.State = states.Registered
      
      return res // === modes
    }

    const modes   = res[tsk]
    if(!modes)
    {
      console.log('mode-not-found', { Opts: opt_, Tasks: res })
      Err_(code.FORBIDDEN, reason.PermissionDenied)
    }
    
    if(!modes[states.State]) 
    modes.State = [ states.Registered ]
    
    return modes
	}
}

module.exports =
{
	Controller : Controller
}