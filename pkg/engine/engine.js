const { Err_ } 	   = require('../system/models')
	, Model 	   = require('../system/models')
	, method	   = require('./methods')
	, db           = require('../config/exports')[Model.segment.db]
	, { ObjectId } = require('mongodb')

var Handler =
{
	[Model.states.None] 					:
	{											
			[Model.event.InitiationByUser] 	: method.InitiatedByUser
	}											
	, [Model.states.CargoInitiated] 		:
	{ 											
		  [Model.event.CancellationByUser] 	: method.CancelledByUser
		, [Model.event.RejectionByStore] 	: method.RejectedByStore
		, [Model.event.TimeoutByStore]		: method.TimeoutByStore
		, [Model.event.AcceptanceByStore]	: method.AcceptedByStore
	}
	, [Model.states.CargoCancelled] 		: {}
	, [Model.states.OrderRejected] 			: {}
	, [Model.states.OrderTimeExceeded] 		: {}
	, [Model.states.OrderAccepted] 			:
	{ 											
		  [Model.event.CancellationByUser] 	: method.CancelledByUser
		, [Model.event.IgnoranceByAgent] 	: method.IgnoredByAgent
		, [Model.event.TimeoutByAgent] 		: method.TimeoutByAgent
		, [Model.event.RejectionByStore] 	: method.RejectedByStore
		, [Model.event.AcceptanceByAgent] 	: method.AcceptedByAgent
		, [Model.event.ProcessByStore]		: method.ProcessedByStore
	}											
	, [Model.states.OrderProcessed] 		:
	{ 											
		  [Model.event.CancellationByUser] 	: method.CancelledByUser
		, [Model.event.IgnoranceByAgent] 	: method.IgnoredByAgent
		, [Model.event.TimeoutByAgent] 		: method.TimeoutByAgent
		, [Model.event.AcceptanceByAgent] 	: method.AcceptedByAgent
	}													
	, [Model.states.OrderIgnored] 			:
	{ 											
			[Model.event.LockByAdmin] 		: method.LockedByAdmin
	}											
	, [Model.states.TransitIgnored] 		:
	{											
			[Model.event.LockByAdmin] 		: method.LockedByAdmin
	}										
	, [Model.states.TransitAbandoned] 		:
	{											
		  [Model.event.TerminationByAdmin] 	: method.TerminatedByAdmin
		, [Model.event.AssignmentByAdmin] 	: method.AssignedByAdmin
		, [Model.event.LockByAdmin] 		: method.LockedByAdmin
	}										
	, [Model.states.OrderOnHold] 			:
	{ 											
		  [Model.event.TerminationByAdmin] 	: method.TerminatedByAdmin
		, [Model.event.AssignmentByAdmin] 	: method.AssignedByAdmin
	}											
	, [Model.states.TransitOnHold] 			:
	{											
		  [Model.event.TerminationByAdmin] 	: method.TerminatedByAdmin
		, [Model.event.AssignmentByAdmin] 	: method.AssignedByAdmin
	}													
	, [Model.states.TransitTimeout] 		: {}
	, [Model.states.TransitAccepted] 		:
	{											
		  [Model.event.CancellationByUser] 	: method.CancelledByUser
		, [Model.event.RejectionByAgent] 	: method.RejectedByAgent 
		, [Model.event.RejectionByStore]  	: method.RejectedByStore
		, [Model.event.DespatchmentByStore] : method.DespatchedByStore
		, [Model.event.ResendOTP] 			: method.ResendOTP
	}											
	, [Model.states.OrderDespatched] 		:
	{											
		  [Model.event.RejectionByAgent] 	: method.RejectedByAgent 
		, [Model.event.CompletionByAgent] 	: method.CompletedByAgent
		, [Model.event.ResendOTP] 			: method.ResendOTP			
	}											
	, [Model.states.TransitRejected] 		:
	{											
		  [Model.event.AcceptanceByAgent] 	: method.AcceptedByAgent
		, [Model.event.IgnoranceByAgent] 	: method.IgnoredByAgent
	}											
	, [Model.states.TranistCompleted] 		: {}
}

var Timer =
{
	  [Model.event.InitiationByUser] 		:
	{
		  Timeout	: Model.delay.StoreRespLimit
		, Event  	: Model.event.TimeoutByStore
	}
	, [Model.event.TimeoutByStore] 			:
	{
		  Timeout	: Model.delay.AdminRespLimit
		, Event  	: Model.event.TimeoutByAdmin
	}
}

var TimerHandler =  async function (ctxt_id, event_)
{
	console.log('set-timeout-event', 
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
			console.log('missing-context-aborting-timer-event', 
			{ 
					TransitID    : ctxt_id
				, Event 	   : event_
				, EventContext : eve_  
			})
			return
		}
		console.log('trigger-timeout-event',
		{ 
			Transit    	   : ctxt
			, Event 	   : event_
			, EventContext : eve_  
		})

		ctxt.Event = eve_.Event

		try { await Transition(ctxt) }
		catch(err)
		{
			console.log('exception-on-timer-event',
			{ Error : err, Transit : ctxt, 
				Event : ctxt.Event, Eve: eve_ 
			})
			return
		}

		    eve_ = Timer[eve_.Event]
		if(eve_ != undefined)
		{
			console.log('trigger-timeout-event-level-2', 
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
	console.log('new-event', { Event: event_, State: state_ }) 
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
		console.log('no-handler-found', { Event: event_, State: state_ })
		Err_(Model.code.BAD_REQUEST,  Model.reason.NoHandlerFound)
	}
	await method_(ctxt)

	let eve_ = Timer[event_]
	if(eve_ != undefined)
	{
		console.log('trigger-timeout-event', 
		{
			TransitID      : ctxt.id
			, Event 	   : event_
			, EventContext : eve_  
		})
		await TimerHandler(ctxt._id, event_)
	}

	console.log('transition-completed', { Transit: ctxt })
}

module.exports =
{
	  Handler 		: Handler
	, Transition 	: Transition
	, GetHandler 	: GetHandler
	, TimerHandler 	: TimerHandler
	, Timer 		: Timer
}