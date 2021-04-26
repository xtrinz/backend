module.exports =
{
		// Transit Machine States
	states:
	{
		// None 					: None.
		  None 						: 'None'
		// CargoInitiated 			: Payment had succeeded.
		, CargoInitiated 			: 'CargoInitiated'
		// CargoCancelled 			: order canceled by user.
		, CargoCancelled 			: 'CargoCancelled'

		// OrderRejected 			: Order rejected by the shop.
		, OrderRejected 			: 'OrderRejected'
		// OrderTimeExceeded		: Order acceptance time limit for shop has been exceeded. 
		, OrderTimeExceeded 		: 'OrderTimeExceeded'
		// OrderAccepted 			: Order accpeted by shop.
		, OrderAccepted 			: 'OrderAccepted'
		// OrderDespatched 			: Order gave to agent by shop.
		, OrderDespatched 			: 'OrderDespatched'

		// TransitIgnored 			: Agent manually ingored the transit.
		, TransitIgnored 			: 'TransitIgnored'
		// TransitTimeout 			: Agent transit acceptance deadline exceeded.
		, TransitTimeout 			: 'TransitTimeout'
		// TransitAccepted 			: Agent accepted the transit.
		, TransitAccepted 			: 'TransitAccepted'
		// TransitRejected 			: Agent droped/rejected the transit after acceptance.
		, TransitRejected 			: 'TransitRejected'
		// TransitEnroute 			: The package is on the way.[state in hold, not decided]
		, TransitEnroute 			: 'TransitEnroute'
		// TranistComplete 			: The package delivered.
		, TranistComplete 			: 'TranistComplete'
	},
		// Transit Delays and Timeouts (in minutes)
	delay:
	{
		// ShopRespLimit    		: Order acceptace delay for shops.
	 	  ShopRespLimit				: 4
		// AgentRespLimit 			: Transit acceptace delay for agents.
		, AgentRespLimit 			: 3
		// AgentFilterLimit 		: Time upper limit to find an agent for delivery.
		, AgentFilterLimit 			: 8
	},

		// Types of events triggered by endpoints. 
	events:
	{
		// EventInitiationByUser 	: event cargo initiated by user
		  EventInitiationByUser		: 'EventInitiationByUser'
		// EventCancellationByUser 	: event cargo cancellation by user
		, EventCancellationByUser	: 'EventCancellationByUser'
		// EventRejectionByShop 	: event order rejection by shop
		, EventRejectionByShop		: 'EventRejectionByShop'
		// EventRespTimeoutByShop 	: event order acceptance timeout
		, EventRespTimeoutByShop	: 'EventRespTimeoutByShop'
		// EventAcceptanceByShop 	: event order acception by shop
		, EventAcceptanceByShop		: 'EventAcceptanceByShop'
		// EventDespatchmentByShop 	: event order despatchment by shop
		, EventDespatchmentByShop	: 'EventDespatchmentByShop'
		// EventIgnoranceByAgent 	: event transit ignorance by agent
		, EventIgnoranceByAgent		: 'EventIgnoranceByAgent'
		// EventRespTimeoutByAgent 	: event transit acceptance timeout
		, EventRespTimeoutByAgent	: 'EventRespTimeoutByAgent'
		// EventAcceptanceByAgent 	: event transit acception by agent
		, EventAcceptanceByAgent	: 'EventAcceptanceByAgent'
		// EventRejectionByAgent 	: event transit rejection by agent
		, EventRejectionByAgent		: 'EventRejectionByAgent'
		// EventCompletionByAgent 	: event tranist completion by agent
		, EventCompletionByAgent	: 'EventCompletionByAgent'
	}
}
