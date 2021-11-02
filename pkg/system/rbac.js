const { resource: rsrc, verb, task, method, mode,
        states, Err_, code, reason } = require('../system/models')

const Controller 		 = function()
{
	this.Controller =
	{
      [rsrc.user]        : require('../tools/rules/access/user')
    , [rsrc.agent]       : require('../tools/rules/access/agent')
    , [rsrc.store]       : require('../tools/rules/access/store')
    , [rsrc.product]     : require('../tools/rules/access/product')
    , [rsrc.cart]        : require('../tools/rules/access/cart')
    , [rsrc.note]        : require('../tools/rules/access/note')
    , [rsrc.address]     : require('../tools/rules/access/address')
    , [rsrc.journal]     : require('../tools/rules/access/journal')
    , [rsrc.transit]     : require('../tools/rules/access/transit')

    // TODO Correct it

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
        , [states.State]: [ states.ToBeApproved ]        
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