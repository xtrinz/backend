
const { Emit }  = require('./events')
	, { Err_ }  = require('../system/models')
	, Model 	= require('../system/models')
	, { Agent } = require('../config/agent/driver')
	, Task 	   	= require('./wrap')
	, history 	= require('./history')
	, db        = require('../config/exports')[Model.segment.db]

// Notify | UpdateState | Payout | OTP
const InitiatedByUser		= async function(ctxt)
{
	console.log('process-cargo-init', ctxt)
	await Emit(Model.alerts.NewOrder, ctxt)

	await Task.Save(ctxt, Model.states.CargoInitiated)
	console.log('cargo-initialised', ctxt)
}

const CancelledByUser		=  async function(ctxt)
{
	console.log('process-cargo-cancellation', ctxt)
	await Emit(Model.alerts.Cancelled, ctxt)

	ctxt.IsLive = false
	await Task.Save(ctxt, Model.states.CargoCancelled)

	await Task.PayOut(ctxt)

	await Task.ResetProduct(ctxt.JournalID)

	console.log('cargo-cancelled', ctxt)
}

const RejectedByStore		= async function(ctxt)
{
	console.log('process-order-rejection', ctxt)
	await Emit(Model.alerts.Rejected, ctxt)

	ctxt.IsLive = false
	await Task.Save(ctxt, Model.states.OrderRejected)

	await Task.PayOut(ctxt)

	await Task.ResetProduct(ctxt.JournalID)

	console.log('order-rejected', ctxt)
}

const ResendOTP			 	= async function(ctxt)
{
	console.log('resend-otp', { Transit: ctxt })
	switch (ctxt.State)
	{
		case Model.states.OrderDespatched:
			// To Authz-User
			ctxt.User.Otp 	= await Task.SendOTP(ctxt.User.MobileNo)
		break
		case Model.states.TransitAccepted:
			// To Authz@Shop
			ctxt.Agent.Otp = await Task.SendOTP(ctxt.Agent.MobileNo)			
		break
	}
	await db.transit.Save(ctxt)	
}

const TimeoutByStore		= async function(ctxt)
{
	// TODO Trigger a timer from InitByUser
	// Set voice Model.alerts thrice
	// on no action from store auto reject the order
	await Task.Save(ctxt, Model.states.TransitAcceptanceTimeout)
}

const AcceptedByStore			=  async function(ctxt)
{
	console.log('process-order-acceptance', ctxt)
	await Emit(Model.alerts.Accepted, ctxt)	// To User: Emit irrespective of it turns to hold

	const agent = await db.agent.NearbyAgent(
			ctxt.Store.Address.Longitude,
			ctxt.Store.Address.Latitude)
	if(!agent)
	{
		console.log('no-agents-order-on-hold', ctxt)
		await Task.PingAdmins(Model.states.OrderIgnored, ctxt)
		return
	}
	ctxt.Agents = [ agent ]
	await Emit(Model.alerts.NewTransit, ctxt)	// To Agents

	await Task.Save(ctxt, Model.states.OrderAccepted)
	console.log('order-accepted-by-shop', ctxt)
}

const ProcessedByStore			=  async function(ctxt)
{
	console.log('process-order-readiness', ctxt)
	await Emit(Model.alerts.Processed, ctxt)

	await Task.Save(ctxt, Model.states.OrderProcessed)
	console.log('order-processed-by-shop', ctxt)
}

const DespatchedByStore		= async function(ctxt)
{
	console.log('process-order-despatchment', ctxt)
	await Task.ConfirmOTP(ctxt.Agent.Otp, ctxt.Store.Otp)
	
	await Emit(Model.alerts.EnRoute, ctxt)

	ctxt.User.Otp 	= await Task.SendOTP(ctxt.User.MobileNo)

		delete ctxt.Agent.Otp
		delete ctxt.Store.Otp
	await Task.Save(ctxt, Model.states.OrderDespatched)
	console.log('order-despatched', ctxt)
}

const IgnoredByAgent		= async function(ctxt)
{
	for (idx = 0; idx < ctxt.Agents.length; idx++) 
	{
		if (String(ctxt.Agents[idx]._id) === String(ctxt.Agent._id)) 
		{ ctxt.Agents.pop(ctxt.Agents[idx]); break }
	}
	if(!ctxt.Agents.length)
	{
		console.log('on-hold-transit-ignored', ctxt)
		await Task.PingAdmins(Model.states.TransitIgnored, ctxt)
		return	
	}
	history.Set(ctxt)
	ctxt.Agent = Task.ResetAgent // Cleared temp data
	ctxt.Event = ''
	await db.transit.Save(ctxt)
}

const TimeoutByAgent		= async function(ctxt)
{
	await Task.Save(ctxt, Model.states.TransitTimeout)
}

const LockedByAdmin		= async function(ctxt)
{
	console.log('process-lock-by-admin', ctxt)
	await Emit(Model.alerts.Locked, ctxt)

	let state_
	switch(ctxt.State)
	{
		case Model.states.OrderIgnored	  	: state_ = Model.states.OrderOnHold	  ; break
		case Model.states.TransitIgnored	: state_ = Model.states.TransitOnHold ; break
		case Model.states.TransitAbandoned 	: state_ = Model.states.TransitOnHold ; break
		// Accepted by agent then rejected and we could not filter new agent pool
	}

	ctxt.Admins = []
	await Task.Save(ctxt, state_)
	console.log('transit-locked-by-admin', ctxt)
}

const AssignedByAdmin		= async function(ctxt)
{
	console.log('agent-assignment-by-admin', ctxt)

	const agent   = new Agent()
	const agent_  = await agent.Get(ctxt.Agent.MobileNo, Model.query.ByMobileNo)
	if(!agent_) Err_(Model.code.NOT_FOUND, Model.reason.AgentNotFound)
	ctxt.Agents = []
	ctxt.Agent  = Task.SetAgent(agent_)

	await Emit(Model.alerts.Assigned,   ctxt)
	await Emit(Model.alerts.AgentReady, ctxt)

	// To Authz@Shop
	ctxt.Agent.Otp = await Task.SendOTP(agent_.MobileNo)

	await Task.Save(ctxt, Model.states.TransitAccepted)
	console.log('agent-assigned-by-admin', ctxt)
}

const TerminatedByAdmin		= async function(ctxt)
{
	console.log('process-termination-by-admin', ctxt)
	await Emit(Model.alerts.Terminated, ctxt)

	ctxt.IsLive = false
	await Task.Save(ctxt, Model.states.TransitTerminated)

	await Task.PayOut(ctxt) // ? Handle loops

	await Task.ResetProduct(ctxt.JournalID)

	console.log('transit-completed', ctxt)
}

const AcceptedByAgent		= async function(ctxt)
{
	console.log('process-transit-acceptace', ctxt)
	await Emit(Model.alerts.AgentReady, ctxt)

	ctxt.Agent.Otp = await Task.SendOTP(ctxt.Agent.MobileNo)// To Authz@Shop
	ctxt.Agents	= []
	
	await Task.Save(ctxt, Model.states.TransitAccepted)
	console.log('transit-accepted', ctxt)
}

const RejectedByAgent		= async function(ctxt)
{
	switch(ctxt.State)
	{
	case Model.states.TransitAccepted:

		const agent = await db.agent.NearbyAgent(
				ctxt.Store.Address.Longitude,
				ctxt.Store.Address.Latitude)
		if(!agent)
		{
			console.log('no-nearby-agents', ctxt)
			await Task.PingAdmins(Model.states.TransitAbandoned, ctxt)
			return
		}
		// ? TODO Resolve the loop, 'auto cancel' on ultra delay
		// add faul rate idx for agent, record reasons as feedback
		// Create new state, Check delay, if it had grown high assign to admin
		// Then give admin an api to filter near by agents to that perticular store
		await Emit(Model.alerts.NewTransit, ctxt)
			ctxt.Agents = [ agent ]
			ctxt.Agent  = Task.ResetAgent
		await Task.Save(ctxt, Model.states.TransitRejected)
		return

	case Model.states.OrderDespatched:
		/** TO-DO: Set 911 ops */
		ctxt.Agent = Task.ResetAgent
		await Task.Save(ctxt, Model.states.TransitOnDrift)
		return
	}
}

const CompletedByAgent		= async function(ctxt)
{
	console.log('process-transit-completion', ctxt)
	await Task.ConfirmOTP(ctxt.User.Otp, ctxt.Agent.Otp)
	
	await Emit(Model.alerts.Delivered, ctxt)
		delete ctxt.Agent.Otp
		delete ctxt.User.Otp
		ctxt.IsLive = false
	await Task.Save(ctxt, Model.states.TranistCompleted)

	await Task.PayOut(ctxt)
	console.log('transit-completed', ctxt)
}

module.exports = 
{
	InitiatedByUser	  : InitiatedByUser,
	CancelledByUser	  : CancelledByUser,
	RejectedByStore	  : RejectedByStore,
	TimeoutByStore	  : TimeoutByStore,
	AcceptedByStore	  : AcceptedByStore,
	ProcessedByStore  : ProcessedByStore,
	DespatchedByStore : DespatchedByStore,
	IgnoredByAgent	  : IgnoredByAgent,
	LockedByAdmin	  : LockedByAdmin,
	TimeoutByAgent 	  : TimeoutByAgent,
	AcceptedByAgent	  : AcceptedByAgent,
	RejectedByAgent	  : RejectedByAgent,
	AssignedByAdmin   : AssignedByAdmin,
	TerminatedByAdmin : TerminatedByAdmin,
	CompletedByAgent  : CompletedByAgent,
	ResendOTP		  : ResendOTP
}