const Model = require('../../../sys/models')
	, Log   = require('../../../sys/log')
	, m	   	= require('./methods')
	, e		= Model.event
	, s		= Model.states

var Handler =
{
	  [s.Pending] 		: { [e.Init] : m.Init }								
	, [s.Initiated]  	: 
	{ 
		  [e.Cancel] 	: m.Cancel
		, [e.Reject] 	: m.Reject
		, [e.Accept] 	: m.Accept 
	}								
	, [s.Assigned] 	 	:
	{ 								
		  [e.Cancel] 	: m.Cancel
		, [e.Ignore] 	: m.Ignore
		, [e.Reject] 	: m.Reject
		, [e.Commit] 	: m.Commit
		, [e.Ready]	 	: m.Ready
	}								
	, [s.Accepted] 	 	:
	{								
		  [e.Cancel] 	: m.Cancel
		, [e.Ignore] 	: m.Ignore
		, [e.Reject] 	: m.Reject
		, [e.Despatch]	: m.Despatch		
		, [e.ResendOTP]	: m.OTP
		, [e.Ready]	 	: m.Ready
	}									
	, [s.OnHold] 	 	: 
	{ 
		  [e.Terminate] : m.Terminate
		, [e.Assign] 	: m.Assign
		, [e.Ready]	 	: m.Ready 
		, [e.Reject] 	: m.Reject		
	}								
	, [s.Despatched] 	:
	{ 
		  [e.Quit] 		: m.Quit
		, [e.ResendOTP] : m.OTP
		, [e.Done]	 	: m.Complete 	
	}
	, [s.Completed]  	: {}
	, [s.Rejected] 	 	: {}
	, [s.Cancelled]  	: {}	
	, [s.Terminated]  	: {}		
}

var GetHandler = (state_, event_) =>
{
	Log('new-event', { Event: event_, State: state_ }) 
	const hdlr = Handler[state_][event_]
	return hdlr 
}

var Transition = async function (ctxt)
{
	let state_  = ctxt.State
	  , event_  = ctxt.Event
	  , method_ = GetHandler(state_, event_)

	if(!method_)
	{
		Log('no-handler-found', { Event: event_, State: state_ })
		Model.Err_(Model.code.BAD_REQUEST,  Model.reason.NoHandlerFound)
	}
	await method_(ctxt)

	Log('transition-completed', { Transit: ctxt })
}

module.exports = { Handler, Transition, GetHandler }