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
			, [event.RejectionByStore] 			: method.RejectedByStore
			, [event.TimeoutByStore]			: method.TimeoutByStore
			, [event.AcceptanceByStore]			: method.AcceptedByStore
		}												
		//, [states.CargoCancelled] 			: {}
		//, [states.OrderRejected] 				: {}
		//, [states.OrderTimeExceeded] 			: {}
		, [states.OrderAccepted] 				:
		{ 												
			  [event.CancellationByUser] 		: method.CancelledByUser
			, [event.IgnoranceByAgent] 			: method.IgnoredByAgent
			, [event.TimeoutByAgent] 			: method.TimeoutByAgent
			, [event.RejectionByStore] 			: method.RejectedByStore
			, [event.AcceptanceByAgent] 		: method.AcceptedByAgent
		}												
		, [states.OrderIgnored] 				:
		{ 												
			  [event.LockByAdmin] 				: method.LockedByAdmin
		}												
		, [states.TransitIgnored] 				:
		{												
			  [event.LockByAdmin] 				: method.LockedByAdmin
		}
		, [states.TransitAbandoned] 			:
		{												
			  [event.TerminationByAdmin] 		: method.TerminatedByAdmin
			, [event.AssignmentByAdmin] 		: method.AssignedByAdmin
			, [event.LockByAdmin] 				: method.LockedByAdmin
		}
		, [states.OrderOnHold] 					:
		{ 												
			  [event.TerminationByAdmin] 		: method.TerminatedByAdmin
			, [event.AssignmentByAdmin] 		: method.AssignedByAdmin
		}												
		, [states.TransitOnHold] 				:
		{												
			  [event.TerminationByAdmin] 		: method.TerminatedByAdmin
			, [event.AssignmentByAdmin] 		: method.AssignedByAdmin
		}														
		//, [states.TransitTimeout] 			: {}
		, [states.TransitAccepted] 				:
		{												
			  [event.CancellationByUser] 		: method.CancelledByUser
			, [event.RejectionByAgent] 			: method.RejectedByAgent 
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
			, [event.IgnoranceByAgent] 			: method.IgnoredByAgent
		}												
		//, [states.TranistComplete] 			: {}
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
		let method_ = this.GetHandler(ctxt.Data.State,     ctxt.Data.Event)
		if (!method_) Err_(code.BAD_REQUEST, reason.MachineHandlerNotFound)
		await method_(ctxt)
	}
}

module.exports =
{
	Engine		: Engine
}