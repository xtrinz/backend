/* 
	Definition of handlers, which triggers state transitions
	01 CargoInitiatedByUser 	|	02 CargoCancelledByUser
	03 OrderRejectedByShop 		|	04 OrderAcceptanceTimeout
	05 OrderAcceptedByShop 		|	06 OrderDespatchedByShop
	07 TransitIgnoredByAgent	|	08 TransitAcceptanceTimeout
	09 TransitAcceptedByAgent 	|	10 TransitRejectedByAgent
	11 TranistCompleteByAgent 	|	
*/

const { states, events } = require("./models")

/*

	Success Flow:
		   CargoInitiatedByUser(A)   -> OrderAcceptedByShop(B)
		-> TransitAcceptedByAgent(C) -> OrderDespatchedByShop(D)
		-> TranistCompleteByAgent(E)

	Common Actions
	1. Update DB with parameter changes and state transition for each event
	2. All events will be send only if client is live, else just keep the DB updated
	   & load the status once client get connects/requests explicitly
	3. Each event can be updated as stastics to admin[ Not planned for now]
*/
		/*
			TODO:
				#api
				#01 Calculate estimated time
		*/
/*
	#Method/ActivatedBy :  01/Server(User)
	Start/End(States) 	:  None/CargoInitiated
	User 				:  Return - cargo init passed
	Agent				:  No Action
	Shop				:  Generate Order Notification
	Admin				:  
*/
const CargoInitiatedByUser		=  function(ctxt)
{
	try
	{
		console.log('init-new-cargo', ctxt)
		

		ctxt.State = states.CargoInitiated
		ctxt.Event = ""
		ctxt.Save()
		// Order notfication to Shop
		// List item, see shop is live, if live send notification and update Schema in DB, else update DB
	} catch(err)
	{
		console.log('cargo-init-failed', err)
	}
}

/*
	#Method/ActivatedBy 		:  02/User
	Start/End(States) 		:  CargoInitiated/CargoCancelled
        Policy				:  TODO Policy for penalty
	User 				:  1. Reject cancellation for single hub process.
					   2. If allowed, set a return transit form current hub to to source,
					      charge penatly & refund the rest.
	Agent				:  
	Shop				:  Event to notify return of commodity 
	Admin				:  
*/
const CargoCancelledByUser		=  function()
{

}

// Shop s

/*
	#Method/ActivatedBy 		:  03/Shop
	Start/End(States) 		:  CargoInitiated/OrderRejected || OrderAccepted/OrderRejected
	User 				:  Event to update rejection [TODO plan for cortesy]
	Agent				:  No Action
	Shop				:  Respond success & Penalty from caution deposit,
					   based on reason/cause for rejection
	Admin				:  
*/
const OrderRejectedByShop		=  function()
{

}

/*
	#Method/ActivatedBy 		:  04/Machine
	Start/End(States) 		:  CargoInitiated/OrderRejected
	[ This event can come multiple times on single process. Listing 'event count'(in []) and 'actions' ] 
	User 				:  [3] If admin does not initiate explicitly action,
					       auto reject the order & refund [May be a different event]
	Agent				:  
	Shop				:  [1] Generate automated SMS/Voice Alert
	Admin				:  [2] Nofify Admin to Call the Customer
					       [TODO set a call-complete API for admin]
*/
const OrderAcceptanceTimeout		=  function()
{

}

/*
	#Method/ActivatedBy 		:  05/Shop
	Start/End(States) 		:  CargoInitiated/OrderAccepted
	Policy				:  TODO Set a policy to for filtering agent based on [Profit/AgentCount/SpacialRadius]
	User 				:  Event for status update(Order Accepted)
	Agent				:  Filter nearby active agents & send acceptance event
	Shop				:  
	Admin				:  If no agents live, report to admin
					   [TODO set a retry tirggering API from admin]
*/
const OrderAcceptedByShop			=  function()
{

}

/*
	#Method/ActivatedBy 		:  06/Shop
	Start/End(States) 		:  TransitAccepted/OrderDespatched
	User 				:  Event to update status
	Agent				:  Event to update status once OTP verfied
	[TODO: Set a API to resent OTP, if agent some how misses the first]
	Shop				:  Read & validate OTP in the request
	Admin				:  Fraud Alert if for incorrect OTP
*/
const OrderDespatchedByShop		=  function()
{

}


// Agent s

/*
	#Method/ActivatedBy 		:  07/Agent
	Start/End(States) 		:  OrderAccepted/TransitIgnored
	[ This event can come from mutiple agent. If waiting time goes beyond 7min auto cancel the order ] 
	User 				:  Event to increase expected waiting time 
	Agent				:  Generate events to add more agents
	Shop				:  Event to increase waiting time
	Admin				:  If agent count drops to zero raise an alarm
*/
const TransitIgnoredByAgent		=  function()
{

}

/*
	#Method/ActivatedBy 		:  08/Machine
	Start/End(States) 		:  OrderAccepted/TransitTimeout 
	User 				:   
	Agent				: 
	Shop				: 
	Admin				: 
*/
const TransitAcceptanceTimeout		=  function()
{

}

/*
	#Method/ActivatedBy 		:  09/Agent
	Start/End(States) 		:  OrderAccepted/TransitAccepted
	User 				:  Event for status update
	Agent				:  1. Send OTP for package collection and shop location
					   2. Send disable order acceptance event to remaining agents
	Shop				:  Event to associate order with agent data.
					   [Validate this OTP at despatch API]
	Admin				:  
*/
const TransitAcceptedByAgent		=  function()
{

}

/*
	#Method/ActivatedBy 		:  10/Agent
	Start/End(States) 		:  TransitAccepted/TransitRejected || OrderDespatched/TransitRejected
	User 				:  
	Agent				:  
	Shop				: 
	Admin				: 
*/
const TransitRejectedByAgent		=  function()
{

}

/*
	#Method/ActivatedBy 		:  11/Agent
	Start/End(States) 		:  OrderDespatched/TranistComplete 
	User 				:  Event for completion [ Rating/ Issue Reporting]
					   [TODO Set an API to handle issue reporting]
	Agent				:  Credit the compensation & Respond with success
	Shop				:  Credit the compensation & Event for status update
	Admin				:  
*/
const TranistCompleteByAgent		=  function()
{

}

module.exports = 
{
	CargoInitiatedByUser		: CargoInitiatedByUser,
	CargoCancelledByUser		: CargoCancelledByUser,
	OrderRejectedByShop		: OrderRejectedByShop,
	OrderAcceptanceTimeout		: OrderAcceptanceTimeout,
	OrderAcceptedByShop		: OrderAcceptedByShop,
	OrderDespatchedByShop		: OrderDespatchedByShop,
	TransitIgnoredByAgent		: TransitIgnoredByAgent,
	TransitAcceptanceTimeout	: TransitAcceptanceTimeout,
	TransitAcceptedByAgent		: TransitAcceptedByAgent,
	TransitRejectedByAgent		: TransitRejectedByAgent,
	TranistCompleteByAgent		: TranistCompleteByAgent
}
