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
		// TranistCompleted 		: The package delivered.
		, TranistCompleted 			: 'TranistCompleted'
	},
		// Transit Delays and Timeouts (in minutes)
	delay:
	{
		// StoreRespLimit    		: Order acceptace delay for shops.
	 	  StoreRespLimit			: 4
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
		// EventRejectionByStore 	: event order rejection by shop
		, EventRejectionByStore		: 'EventRejectionByStore'
		// EventRespTimeoutByStore 	: event order acceptance timeout
		, EventRespTimeoutByStore	: 'EventRespTimeoutByStore'
		// EventAcceptanceByStore 	: event order acception by shop
		, EventAcceptanceByStore	: 'EventAcceptanceByStore'
		// EventDespatchmentByStore : event order despatchment by shop
		, EventDespatchmentByStore	: 'EventDespatchmentByStore'
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
	},
	alerts:
	{
		// NewOrder					: to shop 		on init
		  NewOrder 					: 'New Order'
		// Rejected					: to user 		on rejection by shop
		, Rejected 					: 'Rejected'
		// Cancelled				: to shop 		on cancel by user
		, Cancelled 				: 'Cancelled'
		// Accepted					: to user 		on acceptance from shop
		, Accepted 					: 'Accepted'
		// AutoCancelled			: to user/shop 	on outstanding delay
		, AutoCancelled 			: 'AutoCancelled'
		// NewTransit				: to agents 	on acceptance from shop
		, NewTransit 				: 'New Transit'
		// AgentReady				: to shop/user 	on acceptance from agent 
		, AgentReady 				: 'Agent Ready'
		// EnRoute					: to agent/user on despachement from shop
		, EnRoute 					: 'En Route'
		// Delivered				: to user/shop  on delivery
		, Delivered 				: 'Delivered'
		// Ignored					: to none
		, Ignored 					: 'Ignored'
	},
	entity:
	{
		  User 						: 'User'
		, Store 					: 'Store'
		, Agent 					: 'Agent'
		, Admin 					: 'Admin'
	}
}