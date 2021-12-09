const { Err_ } 	   = require('../system/models')
	, Model 	   = require('../system/models')
	, m	   		   = require('./methods'), e = Model.event, s = Model.states
	, db           = require('../config/exports')[Model.segment.db]
	, { ObjectId } = require('mongodb')
	, Log      	   = require('../system/log')

var Handler =
{
	  [s.None] 		 	: { [e.Init] : m.Init }								
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
}

var Timer =
{
	  [e.Init] 		:
	{
		  Timeout	: Model.delay.StoreRespLimit
		, Event  	: e.TimeoutByStore
	}
	, [e.Timeout] 			:
	{
		  Timeout	: Model.delay.AdminRespLimit
		, Event  	: e.TimeoutByAdmin
	}
}

var TimerHandler =  async function (ctxt_id, event_)
{
	Log('set-timeout-event', 
	{
		  TransitID  : ctxt_id
		, Event 	   : event_
	})

	const func_ = async function()
	{
		let eve_   = Timer[event_]
		let query_ = { _id  : ObjectId(ctxt_id) }
			, ctxt   = await db.transit.Get(query_, Model.query.Custom)
		if (!ctxt)
		{
			Log('missing-context-aborting-timer-event', 
			{ 
					TransitID    : ctxt_id
				, Event 	   : event_
				, EventContext : eve_  
			})
			return
		}
		Log('trigger-timeout-event',
		{ 
			Transit    	   : ctxt
			, Event 	   : event_
			, EventContext : eve_  
		})

		ctxt.Event = eve_.Event

		try { await Transition(ctxt) }
		catch(err)
		{
			Log('exception-on-timer-event',
			{ Error : err, Transit : ctxt, 
				Event : ctxt.Event, Eve: eve_ 
			})
			return
		}

		    eve_ = Timer[eve_.Event]
		if(eve_ != undefined)
		{
			Log('trigger-timeout-event-level-2', 
			{
				  TransitID    : ctxt_id
				, Event 	   : eve_.Event
				, EventContext : eve_  
			})
			await TimerHandler(ctxt._id, event_)
		}

	}
	setTimeout(func_, Timer[event_].Timeout * 60 * 60) // min to ms
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
		Err_(Model.code.BAD_REQUEST,  Model.reason.NoHandlerFound)
	}
	await method_(ctxt)

	let eve_ = Timer[event_]
	if(eve_ != undefined)
	{
		Log('trigger-timeout-event', 
		{
			TransitID      : ctxt.id
			, Event 	   : event_
			, EventContext : eve_  
		})
		//await TimerHandler(ctxt._id, event_)
	}

	Log('transition-completed', { Transit: ctxt })
}

module.exports =
{
	  Handler 		: Handler
	, Transition 	: Transition
	, GetHandler 	: GetHandler
	, TimerHandler 	: TimerHandler
	, Timer 		: Timer
}