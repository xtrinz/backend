const   { states, alerts, entity }	= require("./models")
	  , { Emit } 					= require("./events")
	  , otp 						= require("../common/otp")
	  , { User } 					= require("../database/user")
      , pay 						= require('./payment')

/**
 * #Method/ActivatedBy 	:  01/Server(User)
 * Start/End(States) 	:  None/CargoInitiated
 * Store					:  Event - NewOrder
 **/
const CargoInitiatedByUser		=  function(ctxt)
{
	console.log('process-cargo-init', ctxt)
	const msg = 
	{
		// user? since event initiated by payment gw
		To	: [...ctxt.User.SockID, ...ctxt.Store.SockID],
		Msg	:
		{
			Type: alerts.NewOrder,
			Data: ctxt.Abstract()
		}
	}
	Emit(msg)
	ctxt.State = states.CargoInitiated
	ctxt.Event = ""
	ctxt.Save()
	console.log('cargo-initialised', ctxt)
}

/**
 * #Method/ActivatedBy 	:  02/User
 * Start/End(States) 	:  CargoInitiated/CargoCancelled
 * Policy				:  Cancel permitted before despatchment
 * User 				:  Refund with added penalty
 * Agent				:  Event/s - Cancelled
 * Store					:  Event   - Cancelled
 **/
const CargoCancelledByUser		=  function(ctxt)
{
	console.log('process-cargo-cancellation', ctxt)
	let to = []
	switch(ctxt.State)
	{
		case states.TransitAccepted:
		
		break
		case states.OrderAccepted:
		
		break
	}
	ctxt.State 		= states.CargoCancelled
	ctxt.Event 		= ""
	ctxt.Save()
	pay.ProcessMonetaryReturns(ctxt)
	console.log('cargo-cancelled', ctxt)
}

/**
 * #Method/ActivatedBy 	:  03/Store
 * Start/End(States) 	:  {CargoInitiated,OrderAccepted}/OrderRejected
 * User 				:  Refund. Event - Rejected
 * Store					:  Set Penalty
 **/ 
const OrderRejectedByStore		=  function()
{
	console.log('process-order-rejection', ctxt)
	const msg = 
	{		 
		To	: [...ctxt.User.SockID],
		Msg	:
		{
			Type: alerts.EnRoute,
			Data: ctxt.Abstract()
		}
	}
	Emit(msg)
	ctxt.State 		= states.OrderRejected
	ctxt.Event 		= ""
	ctxt.Save()
	pay.ProcessMonetaryReturns(ctxt)
	console.log('order-rejected', ctxt)
}

/**
 * #Method/ActivatedBy 	:  04/Machine
 * Start/End(States) 	:  CargoInitiated/OrderRejected
 * User 				:  [2] If admin does not initiate explicitly action, auto reject the order & refund [May be a different event]
 * Agent				:
 * Store					:  [1] Generate automated voice alert(repeat thrice if no user action)
 **/
const OrderAcceptanceTimeout		=  function()
{
	ctxt.State 		= "" //states.TransitComplete
	ctxt.Event 		= ""
	ctxt.Save()
}

/*
	#Method/ActivatedBy :  05/Store
	Start/End(States) 	:  CargoInitiated/OrderAccepted
	Policy				:  TODO Set a policy to for filtering agent based on [Profit/AgentCount/SpacialRadius]
	User 				:  Event for status update(Order Accepted)
	Agent				:  Filter nearby active agents & send acceptance event
	Store				:  
	Admin				:  If no agents live, report to admin
					   [TODO set a retry tirggering API from admin]
*/
const OrderAcceptedByStore			=  function()
{
	console.log('process-order-acceptance', ctxt)
	// Store -> User transit will be compensated with delivery charge,
	// hence profitable pooling occures with agents near to shop
	const agent = new User()
	const agents = agent.ListNearbyLiveAgents(ctxt.Store.Location)
	if(!agents)
	{
		// TODO
		/**
		 * Introduce a new state for 'accepted but on hold'
		 * Notify the state to admin with option to Cancel the order or refeed to pipeline
		 * Admin has to send some user to corresponding location on notification pops up
		 * If a agent comes online in a location where orders with these state are available 
		 * The agent should get it notified
		 **/
	}
	let to = []
	agents.forEach((agent)=>{ to.push(...agent.SockID)})
	const msg = 
	{		 
		To	: to,
		Msg	:
		{
			Type: alerts.NewTransit,
			Data: 
			{
				TransitID  		: ctxt._id,
				JournalID		: ctxt.JournalID,
				Origin 			: ctxt.User.Location,
				Destination 	: ctxt.Store.Location,
				ETD 			: ctxt.ETD
			}
		}
	}
	// Frond End has to calculate reach to origin and ETD to origin if needed
	Emit(msg)
	// Save Agent pool to ctxt
	ctxt.State = states.OrderAccepted
	ctxt.Event = ""
	ctxt.Save()
	console.log('order-accepted-by-shop', ctxt)
}

/*
	#Method/ActivatedBy :  06/Store
	Start/End(States) 	:  TransitAccepted/OrderDespatched
	User 				:  Event to update status
	Agent				:  Event to update status once OTP verfied
	[TODO: Set a API to resent OTP, if agent some how misses the first]
	Store				:  Read & validate OTP in the request
	Admin				:  Fraud Alert if for incorrect OTP
*/
const OrderDespatchedByStore		=  function()
{
	console.log('process-order-despatchment', ctxt)
	const msg = 
	{		 
		To	: [...ctxt.Agent.SockID, ...ctxt.User.SockID],
		Msg	:
		{
			Type: alerts.EnRoute,
			Data: ctxt.Abstract()
		}
	}
	Emit(msg)

	let   otp_sms 	= new otp.OneTimePasswd(
						{
							MobNo: 	ctxt.User.ContactNo, 
							Body: 	otp.Msgs.ForPkg
						})
		, hash 		= otp_sms.Send(otp.Opts.SMS)
	
	ctxt.User.Otp 	= hash
	ctxt.State 		= states.OrderDespatched
	ctxt.Event 		= ""
	ctxt.Save()
	console.log('order-despatched', ctxt)
}


// Agent s

/*
	#Method/ActivatedBy :  07/Agent
	Start/End(States) 	:  OrderAccepted/TransitIgnored
	[ This event can come from mutiple agent. If waiting time goes beyond 7min auto cancel the order ] 
	User 				:  Event to increase expected waiting time 
	Agent				:  Generate events to add more agents
	Store				:  Event to increase waiting time
	Admin				:  If agent count drops to zero raise an alarm
*/
const TransitIgnoredByAgent		=  function()
{
	ctxt.State 		= "" //states.TransitComplete
	ctxt.Event 		= ""
	ctxt.Save()
}

/*
	#Method/ActivatedBy :  08/Machine
	Start/End(States) 	:  OrderAccepted/TransitTimeout 
	User 				:   
	Agent				: 
	Store				: 
	Admin				: 
*/
const TransitAcceptanceTimeout		=  function()
{
	ctxt.State 		= "" //states.TransitComplete
	ctxt.Event 		= ""
	ctxt.Save()
}

/*
	#Method/ActivatedBy :  09/Agent
	Start/End(States) 	:  OrderAccepted/TransitAccepted
	User 				:  Event for status update
	Agent				:  1. Send OTP for package collection and shop location
					   	   2. Send disable order acceptance event to remaining agents
	Store				:  Event to associate order with agent data.
					   	   [Validate this OTP at despatch API]
	Admin				:  
*/
const TransitAcceptedByAgent		=  function(ctxt)
{
	// TODO Clear agent pool of the context
	console.log('process-transit-acceptace', ctxt)
	const msg = 
	{		 
		To	: [...ctxt.Store.SockID, ...ctxt.User.SockID],
		Msg	:
		{
			Type: alerts.AgentReady,
			Data: ctxt.Abstract()
		}
	}
	Emit(msg)

	// Send OTP to Agent for authentication at shop
	let   otp_sms 	= new otp.OneTimePasswd(
						{
							MobNo: 	ctxt.Agent.ContactNo, 
							Body: 	otp.Msgs.ForPkg
						})
		, hash 		= otp_sms.Send(otp.Opts.SMS)

	ctxt.Agent.Otp 	= hash
	ctxt.State 		= states.TransitAccepted
	ctxt.Event 		= ""
	ctxt.Save()
	console.log('transit-accepted', ctxt)
}

/*
	#Method/ActivatedBy :  10/Agent
	Start/End(States) 	:  TransitAccepted/OrderDespatched || TransitRejected
	User 				:  
	Agent				:  
	Store				: 
	Admin				: 
*/
const TransitRejectedByAgent		=  function(ctxt)
{
	switch(ctxt.State)
	{
		case states.TransitAccepted:
			/*// validate reason for rejection + take necessary actions
			// increment fault count of current agent agent*/ // not now
			if (ctxt.Delay() > ctxt.MaxWT)
			{
				console.log('order-delay-exceeded', ctxt)
				const msg = 
				{		 
					To	: [...ctxt.Store.SockID, ...ctxt.User.SockID],
					Msg	:
					{
						Type: alerts.AutoCancelled,
						Data: ctxt.Abstract(entity.Agent)
					}
				}
				Emit(msg)
				ctxt.State 		= states.TransitRejected
				ctxt.Event 		= ""
				ctxt.Save()
				return
			}

			// Store -> User transit will be compensated with delivery charge,
			// hence profitable pooling occures with agents near to shop
			const agent  = new User()
			const agents = agent.ListNearbyLiveAgents(ctxt.Store.Location)
			if(!agents)
			{
				// TODO
				/**
				 * Introduce a new state for 'accepted but on hold'
				 * Notify the state to admin with option to Cancel the order or refeed to pipeline
				 * Admin has to send some user to corresponding location on notification pops up
				 * If a agent comes online in a location where orders with these state are available 
				 * The agent should get it notified
				 **/
			}
			let to = []
			agents.forEach((agent)=>{ to.push(...agent.SockID)})
			const msg = 
			{		 
				To	: to,
				Msg	:
				{
					Type: alerts.NewTransit,
					Data: 
					{
						TransitID  		: ctxt._id,
						JournalID			: ctxt.JournalID,
						Origin 			: ctxt.User.Location,
						Destination 	: ctxt.Store.Location,
						ETD 			: ctxt.ETD,
					}
				}
			}
			// Frond End has to calculate reach to origin and ETD to origin if needed
			Emit(msg)

			delete ctxt.Agent
			ctxt.State 		= states.TransitRejected
			ctxt.Event 		= ""
			ctxt.Save()
			return

		case states.OrderDespatched:

	}
}

/*
	#Method/ActivatedBy :  11/Agent
	Start/End(States) 	:  OrderDespatched/TransitCompleted 
	User 				:  Event for status update
	Agent				:  Respond with success 	& Credit the compensation
	Store				:  Event for status update 	& Credit the compensation
	Admin				:  
*/
const TransitCompletedByAgent		=  function(ctxt)
{
	console.log('process-transit-completion', ctxt)
	const msg = 
	{		 
		To	: [...ctxt.Store.SockID, ...ctxt.User.SockID],
		Msg	:
		{
			Type: alerts.EnRoute,
			Data: ctxt.Abstract()
		}
	}
	Emit(msg)

	ctxt.State 		= states.TransitComplete
	ctxt.Event 		= ""
	ctxt.Save()

	pay.ProcessMonetaryReturns(ctxt)

	console.log('transit-completed', ctxt)
}

module.exports = 
{
	CargoInitiatedByUser		: CargoInitiatedByUser,
	CargoCancelledByUser		: CargoCancelledByUser,
	OrderRejectedByStore			: OrderRejectedByStore,
	OrderAcceptanceTimeout		: OrderAcceptanceTimeout,
	OrderAcceptedByStore			: OrderAcceptedByStore,
	OrderDespatchedByStore		: OrderDespatchedByStore,
	TransitIgnoredByAgent		: TransitIgnoredByAgent,
	TransitAcceptanceTimeout	: TransitAcceptanceTimeout,
	TransitAcceptedByAgent		: TransitAcceptedByAgent,
	TransitRejectedByAgent		: TransitRejectedByAgent,
	TransitCompletedByAgent		: TransitCompletedByAgent
}
