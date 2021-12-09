const Model = require('../system/models')
      , Log = require('./log')

    , Controller 		 = function()
{
	this.Controller =
	{
      [Model.resource.user]        : require('../tools/rules/access/user')
    , [Model.resource.agent]       : require('../tools/rules/access/agent')
    , [Model.resource.admin]       : require('../tools/rules/access/admin')    
    , [Model.resource.store]       : require('../tools/rules/access/store')
    , [Model.resource.product]     : require('../tools/rules/access/product')
    , [Model.resource.cart]        : require('../tools/rules/access/cart')
    , [Model.resource.note]        : require('../tools/rules/access/note')
    , [Model.resource.address]     : require('../tools/rules/access/address')
    , [Model.resource.journal]     : require('../tools/rules/access/journal')
    , [Model.resource.transit]     : require('../tools/rules/access/transit')

    // TODO Correct it

    // Cloudinary Sign
  , [Model.resource.cloudinary]    : // TODO correct it root as rsrc and checkout as verb
    {
      [Model.verb.root]        :
      {
        [Model.method.post]    :
        {
          [Model.mode.User]    : false
        , [Model.mode.Agent]   : false
        , [Model.mode.Store]   : true
        , [Model.mode.Admin] 	 : false
        , [Model.mode.Enabled] : true
        , [Model.task.Enabled] : false
        , [Model.states.State]: [ Model.states.MobConfirmed, Model.states.ToBeApproved, Model.states.Registered ]        
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
    Log('new-query', opt_)
    const verbs   = this.Controller[src]
    if(!verbs)
    {
      Log('resouce-not-found', opt_)
      Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
    }
    const methods = verbs[vrb]
    if(!methods)
    {
      Log('verb-not-found', { Opts: opt_, Verb: verbs })
      Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
    }
    const res     = methods[mthd]
    if(!res)
    {
      Log('method-not-found', { Opts: opt_, Methods: methods })
      Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
    }

    if(!res[Model.task.Enabled]) 
    {
      
      if(!res[Model.states.State]) 
      res.State = Model.states.Registered
      
      return res // === modes
    }

    const modes   = res[tsk]
    if(!modes)
    {
      Log('mode-not-found', { Opts: opt_, Tasks: res })
      Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
    }
    
    if(!modes[Model.states.State]) 
    modes.State = [ Model.states.Registered ]
    
    return modes
	}
}

module.exports =
{
	Controller : Controller
}