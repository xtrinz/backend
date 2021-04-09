// Definition of the machine
const {state, event}	= require("./models")
const method		= require("./methods")
const Machine 		=
{
	Handler :
	{
		  state.None 				:
		{
			  event.EventInitiationByUser 		: method.CargoInitiatedByUser
		}
		, state.CargoInitiated 		:
		{ 
			  event.EventCancellationByUser 	: method.CargoCancelledByUser
			, event.EventRejectionByShop 		: method.OrderRejectedByShop // #02
			, event.EventAcceptanceTimeout		: method.OrderAcceptanceTimeout
			, event.EventAcceptanceByShop		: method.OrderAcceptedByShop
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
			  event.EventIgnoranceByAgent 		: method.TransitIgnoredByAgent
			, event.EventRespTimeoutByAgent 	: method.TransitAcceptanceTimeout
			, event.EventRejectionByShop 		: method.OrderRejectedByShop// handler separately #02
			, event.EventAcceptanceByAgent 		: method.TransitAcceptedByAgent
		}

		, state.TransitIgnored 		:
		{

		}

		, state.TransitTimeout 		:
		{

		}

		, state.TransitAccepted 	:
		{
			  event.EventRejectionByAgent 		: method.TransitRejectedByAgent // handle separately?#01 
			, event.EventRejectionByShop  		: method.CargoCancelledByUser
			, event.EventDespatchmentByShop 	: method.OrderDespatchedByShop
		}

		, state.OrderDespatched 	:
		{
			  event.EventRejectionByAgent 		: method.TransitRejectedByAgent // #01 
			, event.EventCompletionByAgent 		: method.TranistCompleteByAgent
		}

		, state.TransitRejected 	:
		{

		}

		, state.TranistComplete 	:
		{

		}
	}

	, GetHandler: function (present_state, event) 
	{ 
		return this.Handler.present_state.event 
	}

	, Transition: function (ctxt)
	{
		let Method = this.GetHandler(ctxt.State, ctxt.Event)
		if (Method !== undefined)
		{
			
		}
		Method(ctxt.Data)
	}
}
