const {states, event}		 = require("../common/models")
	, { Err_, code, reason } = require("../common/error")
	, method				 = require("./methods")

const Engine 				 = function()
{
	this.Handler =
	{
		  [states.None] 						:
		{												
			  [event.InitiationByUser] 			: method.InitiatedByUser
		}												
		, [states.CargoInitiated] 				:
		{ 												
			  [event.CancellationByUser] 		: method.CancelledByUser
			, [event.RejectionByStore] 			: method.RejectedByStore // #02
			, [event.TimeoutByStore]			: method.TimeoutByStore
			, [event.AcceptanceByStore]			: method.AcceptedByStore
		}												
		, [states.CargoCancelled] 				: {}
		, [states.OrderRejected] 				: {}
		, [states.OrderTimeExceeded] 			: {}
		, [states.OrderAccepted] 				:
		{ 												
			  [event.IgnoranceByAgent] 			: method.IgnoredByAgent
			, [event.TimeoutByAgent] 			: method.TimeoutByAgent
			, [event.RejectionByStore] 			: method.RejectedByStore 		// handle separately #02
			, [event.AcceptanceByAgent] 		: method.AcceptedByAgent
		}												
		, [states.OrderOnHold] 					:
		{ 												
			  [event.RefeedByAdmin] 			: method.AcceptedByStore
		}												
		, [states.TransitIgnored] 				:
		{												
			[event.RefeedByAdmin] 				: method.AcceptedByStore
		}												
		, [states.TransitTimeout] 				: {}
		, [states.TransitAccepted] 				:
		{												
			  [event.RejectionByAgent] 			: method.RejectedByAgent 
			, [event.RejectionByStore]  		: method.RejectedByStore
			, [event.DespatchmentByStore] 		: method.DespatchedByStore
		}												
		, [states.OrderDespatched] 				:
		{												
			  [event.RejectionByAgent] 			: method.RejectedByAgent 
			, [event.CompletionByAgent] 		: method.CompletedByAgent
		}												
		, [states.TransitRejected] 				:
		{												
			  [event.AcceptanceByAgent] 		: method.AcceptedByAgent
		}												
		, [states.TranistComplete] 				: {}
	}

	, this.GetHandler = (state_, event_) =>
	{
		console.log('new-event', { Event: event_, State: state_ }) 
		const hdlr = this.Handler[state_][event_]
		if(!hdlr) console.log('no-handler-found', { Event: event_, State: state_ })
		return hdlr 
	}

	, this.Transition = async function (ctxt)
	{
		let method = this.GetHandler(ctxt.Data.State,     ctxt.Data.Event)
		if (!method) Err_(code.BAD_REQUEST, reason.MachineHandlerNotFound)
		await method(ctxt)
	}
}

module.exports =
{
	Engine		: Engine
}