// Definition of the machine
const {state, events}	= require("./models")
const method		= require("./methods")
const Machine 		=
{
	Handler :
	{
		  state.None 				:
		{
			  events.EventInitiationByUser 		: method.CargoInitiatedByUser
		}
		, state.CargoInitiated 		:
		{ 
			  events.EventCancellationByUser 	: method.CargoCancelledByUser
			, events.EventRejectionByShop 		: method.OrderRejectedByShop // #02
			, events.EventAcceptanceTimeout		: method.OrderAcceptanceTimeout
			, events.EventAcceptanceByShop		: method.OrderAcceptedByShop
		}
		, state.CargoCancelled 		:
		{

		}

		, state.OrderRejected 		:
		{ 

		}
		, state.OrderTimeExceeded 	:
		{ 
			
		}

		, state.OrderAccepted 		:
		{ 
			  events.EventIgnoranceByAgent 		: method.TransitIgnoredByAgent
			, events.EventRespTimeoutByAgent 	: method.TransitAcceptanceTimeout
			, events.EventRejectionByShop 		: method.OrderRejectedByShop// handler separately #02
			, events.EventAcceptanceByAgent 	: method.TransitAcceptedByAgent
		}

		, state.TransitIgnored 		:
		{

		}

		, state.TransitTimeout 		:
		{

		}

		, state.TransitAccepted 	:
		{
			  events.EventRejectionByAgent 		: method.TransitRejectedByAgent // handle separately?#01 
			, events.EventRejectionByShop  		: method.CargoCancelledByUser
			, events.EventDespatchmentByShop 	: method.OrderDespatchedByShop
		}

		, state.OrderDespatched 	:
		{
			  events.EventRejectionByAgent 		: method.TransitRejectedByAgent // #01 
			, events.EventCompletionByAgent 	: method.TranistCompleteByAgent
		}

		, state.TransitRejected 	:
		{

		}

		, state.TranistComplete 	:
		{

		}
	}

	, GetHandler: (state, events) => { return this.Handler.state.events }

	, Transition: function (ctxt)
	{
		let Method = this.GetHandler(ctxt.State, ctxt.Event)
		if (Method !== undefined)
		{
			
		}
		Method(ctxt.Data)
	}
}
