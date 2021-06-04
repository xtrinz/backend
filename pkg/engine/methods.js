const   { Emit } 			   = require("./events")
	  , otp 				   = require("../common/otp")
	  , { Err_, code, reason } = require("../common/error")
	  , { states, alerts }	   = require("../common/models")
	  , { User } 			   = require("../objects/user")
	  , { Journal } 		   = require("../objects/journal")

/**
 * #Method/ActivatedBy 	:  01/Server(User)
 * Start/End(States) 	:  None/CargoInitiated
 * Store				:  Event - NewOrder
 **/
const CargoInitiatedByUser		= async function(ctxt)
{
	console.log('process-cargo-init', ctxt.Data)
	const msg = 
	{
		// user? since event initiated by payment gw
		To	: [...ctxt.Data.User.SockID, ...ctxt.Data.Store.SockID],
		Msg	:
		{
			Type: alerts.NewOrder,
			Data: ctxt.Abstract()
		}
	}
	await Emit(msg)
	ctxt.Data.State = states.CargoInitiated
	ctxt.Data.Event = ""
	await ctxt.Save()
	console.log('cargo-initialised', ctxt.Data)
}

/**
 * #Method/ActivatedBy 	:  02/User
 * Start/End(States) 	:  CargoInitiated/CargoCancelled
 * Policy				:  Permit cancel before despatchment
 * User 				:  Refund with added penalty
 * Agent				:  Event/s - Cancelled
 * Store				:  Event   - Cancelled
 **/
const CargoCancelledByUser		=  function(ctxt)
{
	console.log('process-cargo-cancellation', ctxt.Data)
	let to = []
	switch(ctxt.Data.State)
	{
		case states.TransitAccepted :
			to.push(...ctxt.Data.Agent.SockID)
			to.push(...ctxt.Data.Shop.SockID)
			break
		case states.OrderAccepted 	:
			ctxt.Data.Agents.forEach((agent)=>
			{ to.push(...agent.SockID) })
			to.push(...ctxt.Data.Shop.SockID)
			break
		case states.CargoInitiated:
			to.push(...ctxt.Data.Shop.SockID)
			break
		default :
			console.log('cannot-be-cancelled', ctxt.Data)
			Err_(code.BAD_REQUEST, reason.CancellationDenied)
	}

	ctxt.Data.Return 	= ctxt.Data.State
	ctxt.Data.State 	= states.CargoCancelled
	ctxt.Data.Event 	= ""
	ctxt.Save()
	
	let journal = new Journal()
	journal.PayOut(ctxt)

	console.log('cargo-cancelled', ctxt.Data)
}

/**
 * #Method/ActivatedBy 	:  03/Store
 * Start/End(States) 	:  {CargoInitiated,OrderAccepted}/OrderRejected
 * User 				:  Refund. Event - Rejected
 * Store				:  Set Penalty
 **/ 
const OrderRejectedByStore		=  function()
{
	console.log('process-order-rejection', ctxt.Data)
	const msg = 
	{		 
		To	: [...ctxt.Data.User.SockID],
		Msg	:
		{
			Type: alerts.EnRoute,
			Data: ctxt.Abstract()
		}
	}
	Emit(msg)
	ctxt.Data.State 		= states.OrderRejected
	ctxt.Data.Event 		= ""
	ctxt.Save()

	let journal = new Journal()
	journal.PayOut(ctxt)
	
	console.log('order-rejected', ctxt.Data)
}

/**
 * #Method/ActivatedBy 	:  04/Machine
 * Start/End(States) 	:  CargoInitiated/OrderRejected
 * User 				:  [2] If admin does not initiate explicitly action, auto reject the order & refund [May be a different event]
 * Agent				:
 * Store				:  [1] Generate automated voice alert(repeat thrice if no user action)
 **/
const OrderAcceptanceTimeout		=  function(ctxt)
{
	// Create a machine call to this function from init API
	// after saving the context setting event as timeout

	ctxt.Data.State 		= states.TransitAcceptanceTimeout
	ctxt.Data.Event 		= ""
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
*/
const OrderAcceptedByStore			=  function(ctxt)
{
	console.log('process-order-acceptance', ctxt.Data)

	const agent = new User()
	const agents = agent.ListNearbyLiveAgents(ctxt.Data.Store.Location)
	if(!agents)
	{
		console.log('no-pickup-agents-order-on-hold', ctxt.Data)
		// Notify admin about the absents of live agents
		const msg_to_admin = 
		{		 
			To	: ctxt.Data.User.SockID, // SET ADMIN
			Msg	:
			{
				Type: alerts.NoAgents,
				Data: ctxt.Abstract()
			}
		}
		Emit(msg_to_admin)

		ctxt.Data.State  = states.OrderOnHold
		ctxt.Data.Event  = ""
		ctxt.Save()
		return
	}

	// Notify newby agents
	let to = []
	agents.forEach((agent)=>{ to.push(...agent.SockID)})
	const msg_to_agents = 
	{		 
		To	: to,
		Msg	:
		{
			Type: alerts.NewTransit,
			Data: 
			{
				  TransitID  	: ctxt._id
				, JournalID		: ctxt.JournalID
				, OriginName 	: ctxt.Store.Name
				, OriginCity 	: ctxt.Store.City
				, OriginLocation: ctxt.Store.Location
				, Destination 	: ctxt.User.Location
				, ETD 			: ctxt.ETD
			}
		}
	}
	// Frond End has to calculate reach to origin and ETD to origin if needed
	Emit(msg_to_agents)

	// Save Agent pool to ctxt
	ctxt.Agents = agents
	ctxt.State  = states.OrderAccepted
	ctxt.Event  = ""
	ctxt.Save()
	
	// Notify user about the acceptance of order
	const msg_to_user = 
	{		 
		To	: ctxt.User.SockID,
		Msg	:
		{
			Type: alerts.Accepted,
			Data: ctxt.Abstract()
		}
	}
	Emit(msg_to_user)
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
const OrderDespatchedByStore		=  function(ctxt)
{
	// TODO set ctxt.Shop.Otp from route
	console.log('process-order-despatchment', ctxt)
	
	const otp_ = new otp.OneTimePasswd({MobNo: "", Body: ""})
	const status_ = await otp_.Confirm(ctxt.Agent.Otp, ctxt.Shop.Otp)
	if (!status_) Err_(code.BAD_REQUEST, reason.OtpRejected)

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
const TransitIgnoredByAgent		=  function(ctxt)
{
	// TODO set Agent ID to Agent Context from route
	for (idx = 0; idx < ctxt.Agents.length; idx++) 
	{
		let agent = ctxt.Agents[idx]
		if (agent._id === ctxt.Agent._id) 
		{
			ctxt.Agents.pop(agent)
			break; 
		}
	}

	if(!ctxt.Agents.length)
	{
		console.log('all-agents-ignored-the-tranist-transit-on-hold', ctxt)
		const msg_to_admin = 
		{		 
			To	: ctxt.User.SockID, // SET ADMIN
			Msg	:
			{
				Type: alerts.NoAgents,
				Data: ctxt.Abstract()
			}
		}
		Emit(msg_to_admin)

		ctxt.State  = states.TransitIgnored
		ctxt.Event  = ""
		ctxt.Save()
		return	
	}

	delete ctxt.Agent
	ctxt.Event  = ""
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
	// set ctxt.Agent from route itself
	let AgentsSockID = []
	ctxt.Agents.forEach((agent)=>
	{ 
		if (agent._id !== ctxt.Agent._id)
		{ AgentsSockID.push(...agent.SockID) }
	})

	console.log('process-transit-acceptace', ctxt)
	const msg = 
	{		 
		To	: [...ctxt.Store.SockID, ...ctxt.User.SockID, ...AgentsSockID], // To Agents as alert to delete past event
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
	ctxt.Agents		= []
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
 			/* Logic to be streamlined :
				0) Not for now: Handle reason for rejection/ agent fault rating index/ admin actions if any 
				1) How to cutoff if a agent intentionally delays an order with repeatetion accept/reapeat
				2) How to handle if accept /reject loop grows beyond a expected time */

			const agent = new User()
			const agents = agent.ListNearbyLiveAgents(ctxt.Store.Location)
			if(!agents)
			{
				// Notify admin about the absents of live agents
				console.log('no-nearby-agents-order-on-hold', ctxt)
				const msg_to_admin = 
				{		 
					To	: ctxt.User.SockID, // SET ADMIN
					Msg	:
					{
						Type: alerts.NoAgents,
						Data: ctxt.Abstract()
					}
				}
				Emit(msg_to_admin)
		
				ctxt.State  = states.OrderOnHold
				ctxt.Event  = ""
				ctxt.Save()
				return
			}
		
			// Notify nearby agents
			let to = []
			agents.forEach((agent)=>{ to.push(...agent.SockID)})
			const msg_to_agents = 
			{		 
				To	: to,
				Msg	:
				{
					Type: alerts.NewTransit,
					Data: 
					{
						  TransitID  	: ctxt._id
						, JournalID		: ctxt.JournalID
						, OriginName 	: ctxt.Store.Name
						, OriginCity 	: ctxt.Store.City
						, OriginLocation: ctxt.Store.Location
						, Destination 	: ctxt.User.Location
						, ETD 			: ctxt.ETD
					}
				}
			}
			// Frond End has to calculate reach to origin and ETD to origin if needed
			Emit(msg_to_agents)
			ctxt.Agents = agents

		case states.OrderDespatched:
			/**
			 * Generate new notification to agent with
			 * location as of current agent location
			 * notify admin to track furthur progress
			 */

	}

	delete ctxt.Agent
	ctxt.State 		= states.TransitRejected
	ctxt.Event 		= ""
	ctxt.Save()
	return
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
	// TODO set otp on agent context
	const otp_    = new otp.OneTimePasswd({MobNo: "", Body: ""})
	const status_ = otp_.Confirm(ctxt.User.Otp, ctxt.Agent.Otp)
	if (!status_) Err_(code.BAD_REQUEST, reason.OtpRejected)

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

	let journal = new Journal()
	journal.PayOut(ctxt)

	console.log('transit-completed', ctxt)
}

module.exports = 
{
	CargoInitiatedByUser		: CargoInitiatedByUser,
	CargoCancelledByUser		: CargoCancelledByUser,
	OrderRejectedByStore		: OrderRejectedByStore,
	OrderAcceptanceTimeout		: OrderAcceptanceTimeout,
	OrderAcceptedByStore		: OrderAcceptedByStore,
	OrderDespatchedByStore		: OrderDespatchedByStore,
	TransitIgnoredByAgent		: TransitIgnoredByAgent,
	TransitAcceptanceTimeout	: TransitAcceptanceTimeout,
	TransitAcceptedByAgent		: TransitAcceptedByAgent,
	TransitRejectedByAgent		: TransitRejectedByAgent,
	TransitCompletedByAgent		: TransitCompletedByAgent
}
