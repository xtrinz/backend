const Model = require('../../system/models')
	, m	   	= require('./methods')
    , e     = Model.event
    , s     = Model.states

var Handler =
{
	  [s.None] 		 	: 
    { 
          [e.Create]    : m.Create  
    }								
	, [s.New]  	        : 
    { 
          [e.Create]    : m.Create  
        , [e.Confirm]   : m.Confirm
    }								
	, [s.MobConfirmed] 	:
	{
          [e.Create]    : m.Create          
		, [e.Register] 	: m.Register
	}								
	, [s.Registered] 	:
	{
          [e.Create]    : m.Login 
        , [e.Confirm]   : m.Token                 
		, [e.Edit] 	    : m.Edit
	}
}

var GetHandler = (state_, event_) =>
{
	console.log('new-event', { Event: event_, State: state_ }) 
	const hdlr = Handler[state_][event_]
	return hdlr 
}

var Transition = async function (ctxt)
{
	let state_  = ctxt.User.State
	  , event_  = ctxt.Event
	  , method_ = GetHandler(state_, event_)

	if(!method_)
	{
		console.log('no-handler-found', { Event: event_, State: state_ })
		Model.Err_(Model.code.BAD_REQUEST,  Model.reason.NoHandlerFound)
	}
	let data_ = await method_(ctxt)

	console.log('transition-completed', { Transit: ctxt })
    return data_
}

module.exports =
{
	  Handler 		: Handler
	, Transition 	: Transition
}