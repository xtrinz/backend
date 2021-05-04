const {states, events}				= require("./models")
const method						= require("./methods")
const { Err, code, status, reason } = require("../common/error")
const Machine 						=
{
	Handler :
	{
		  [states.None] 							:
		{
			  [events.EventInitiationByUser] 		: method.CargoInitiatedByUser
		}
		, [states.CargoInitiated] 					:
		{ 
			  [events.EventCancellationByUser] 		: method.CargoCancelledByUser
			, [events.EventRejectionByShop] 		: method.OrderRejectedByShop // #02
			, [events.EventAcceptanceTimeout]		: method.OrderAcceptanceTimeout
			, [events.EventAcceptanceByShop]		: method.OrderAcceptedByShop
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
			, [events.EventRejectionByShop] 		: method.OrderRejectedByShop// handler separately #02
			, [events.EventAcceptanceByAgent] 		: method.TransitAcceptedByAgent
		}

		, [states.TransitIgnored] 					:
		{

		}

		, [states.TransitTimeout] 					:
		{

		}

		, [states.TransitAccepted] 					:
		{
			  [events.EventRejectionByAgent] 		: method.TransitRejectedByAgent 
			, [events.EventRejectionByShop]  		: method.CargoCancelledByUser
			, [events.EventDespatchmentByShop] 		: method.OrderDespatchedByShop
		}

		, [states.OrderDespatched] 					:
		{
			  [events.EventRejectionByAgent] 		: method.TransitRejectedByAgent 
			, [events.EventCompletionByAgent] 		: method.TransitCompletedByAgent
		}

		, [states.TransitRejected] 					:
		{
			  [events.EventAcceptanceByAgent] 		: method.TransitAcceptedByAgent
			,
		}

		, [states.TranistComplete] 					:
		{

		}
	}

	, GetHandler: (state_, event_) => { return this.Handler[state_][event_] }

	, Transition: function (ctxt)
	{
		let method = this.GetHandler(ctxt.State, ctxt.Event)
		if (!method)
		{
			console.log('transit-machine-handler-not-found', ctxt.State, ctxt.Event)
			throw new Err(code.BAD_REQUEST,
						  status.Failed,
						  reason.MachineHandlerNotFound)
		}
		method(ctxt)
	}
}

module.exports =
{
	machine		: Machine
}