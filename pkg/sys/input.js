const Model = require('../sys/models')
    , niv   = require('node-input-validator')
    , Log   = require('./log')

const Controller 		 = function()
{
	this.Controller =
	{
    [Model.resource.client]         : require('../tool/rules/input/client')
  , [Model.resource.agent]          : require('../tool/rules/input/agent')   
  , [Model.resource.arbiter]        : require('../tool/rules/input/arbiter')     
  , [Model.resource.seller]         : require('../tool/rules/input/seller')
  , [Model.resource.product]        : require('../tool/rules/input/product')
  , [Model.resource.cart]           : require('../tool/rules/input/cart')
  , [Model.resource.note]           : require('../tool/rules/input/note')
  , [Model.resource.address]        : require('../tool/rules/input/address')
  , [Model.resource.journal]        : require('../tool/rules/input/journal')
  , [Model.resource.transit]        : require('../tool/rules/input/transit')
  , [Model.resource.socket]         : require('../tool/rules/input/socket')
  , [Model.resource.paytm]          : require('../tool/rules/input/paytm')

  // TODO Cloudinary
  , [Model.resource.cloudinary]     : // TODO correct it root as rsrc and checkout as verb
    {
      [Model.verb.root]                :
      {
        [Model.method.post]            : 
        {
            'query'                 : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
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
        
        Log('iv-new-query', opt_)
        const verbs   = this.Controller[src]
        if(!verbs)
        {
            Log('iv-resouce-not-found', opt_)
            Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
        }

        const methods = verbs[vrb]
        if(!methods)
        {
            Log('iv-verb-not-found', { Opts: opt_, Verb: verbs })
            Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
        }

        const rules     = methods[mthd]
        if(!rules)
        {
            Log('iv-method-not-found', { Opts: opt_, Methods: methods })
            Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
        }

        const err_    = this.SetErr(rules)

        const v       = new niv.Validator(req, rules) // TODO add errors rules.Body
        const matched = await v.check()
        if(!matched)
        {
            Log('iv-incorrect-input', { Opts: opt_, Rule: rules, Err: JSON.stringify(v.errors) })
            Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
        }      
    }
}

module.exports =
{
	Controller : Controller
}