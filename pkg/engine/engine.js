const {states, events}				= require("../common/models")
const method						= require("./methods")
const { Err, code, status, reason } = require("../common/error")
const Engine 						= function()
{
	this.Handler =
	{
		  [states.None] 							:
		{
			  [events.EventInitiationByUser] 		: method.CargoInitiatedByUser
		}
		, [states.CargoInitiated] 					:
		{ 
			  [events.EventCancellationByUser] 		: method.CargoCancelledByUser
			, [events.EventRejectionByStore] 		: method.OrderRejectedByStore // #02
			, [events.EventAcceptanceTimeout]		: method.OrderAcceptanceTimeout
			, [events.EventAcceptanceByStore]		: method.OrderAcceptedByStore
		}
		, [states.CargoCancelled] 					:
		{

		}

		, [states.OrderRejected] 					:
		{ 

		}
		, [states.OrderTimeExceeded] 				:
		{ 
			
		}

		, [states.OrderAccepted] 					:
		{ 
			  [events.EventIgnoranceByAgent] 		: method.TransitIgnoredByAgent
			, [events.EventRespTimeoutByAgent] 		: method.TransitAcceptanceTimeout
			, [events.EventRejectionByStore] 		: method.OrderRejectedByStore 		// handler separately #02
			, [events.EventAcceptanceByAgent] 		: method.TransitAcceptedByAgent
		}

		, [states.OrderOnHold] 						:
		{ 
			  [events.EventRefeedAgentsByAdmin] 	: method.OrderAcceptedByStore
		}

		, [states.TransitIgnored] 					:
		{
			[events.EventRefeedAgentsByAdmin] 		: method.OrderAcceptedByStore
		}

		, [states.TransitTimeout] 					:
		{

		}

		, [states.TransitAccepted] 					:
		{
			  [events.EventRejectionByAgent] 		: method.TransitRejectedByAgent 
			, [events.EventRejectionByStore]  		: method.CargoCancelledByUser
			, [events.EventDespatchmentByStore] 	: method.OrderDespatchedByStore
		}

		, [states.OrderDespatched] 					:
		{
			  [events.EventRejectionByAgent] 		: method.TransitRejectedByAgent 
			, [events.EventCompletionByAgent] 		: method.TransitCompletedByAgent
		}

		, [states.TransitRejected] 					:
		{
			  [events.EventAcceptanceByAgent] 		: method.TransitAcceptedByAgent
		}

		, [states.TranistComplete] 					:
		{

		}
	}

	, this.GetHandler = (state_, event_) =>
	{
		console.log('new-event', { Event: event_, State: state_ }) 
		return this.Handler[state_][event_] 
	}

	, this.Transition = async function (ctxt)
	{
		let method = this.GetHandler(ctxt.Data.State, ctxt.Data.Event)
		if (!method)
		{
			console.log('transit-machine-handler-not-found', ctxt.State, ctxt.Event)
			throw new Err(code.BAD_REQUEST,
						  status.Failed,
						  reason.MachineHandlerNotFound)
		}
		await method(ctxt)
	}
}

module.exports =
{
	Engine		: Engine
}