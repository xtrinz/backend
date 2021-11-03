const { 
        resource: rsrc, verb,
        method, Err_, code, reason
      }               = require('../system/models')
    , niv             = require('node-input-validator')

const Controller 		 = function()
{
	this.Controller =
	{
    [rsrc.user]           : require('../tools/rules/input/user')
  , [rsrc.agent]          : require('../tools/rules/input/agent')   
  , [rsrc.store]          : require('../tools/rules/input/store')
  , [rsrc.product]        : require('../tools/rules/input/product')
  , [rsrc.cart]           : require('../tools/rules/input/cart')
  , [rsrc.note]           : require('../tools/rules/input/note')
  , [rsrc.address]        : require('../tools/rules/input/address')
  , [rsrc.journal]        : require('../tools/rules/input/journal')
  , [rsrc.transit]        : require('../tools/rules/input/transit')
  , [rsrc.socket]         : require('../tools/rules/input/socket')
  , [rsrc.paytm]          : require('../tools/rules/input/paytm')

  // TODO Cloudinary
  , [rsrc.cloudinary]     : // TODO correct it root as rsrc and checkout as verb
    {
      [verb.root]                :
      {
        [method.post]            : 
        {
            'query'                 : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ]            
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
          , 'body.IsCOD'         : [ 'required', 'boolean' ]          
          , 'body.Longitude'     : [ 'required', 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'      : [ 'required', 'numeric', [ 'between', -90, 90 ] ]
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