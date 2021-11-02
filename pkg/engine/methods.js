
const { Emit }  = require('./events')
	, { Err_ }  = require('../system/models')
	, Model 	= require('../system/models')
	, { Agent } = require('../config/agent/driver')
	, Task 	   	= require('./wrap')
	, db        = require('../config/exports')[Model.segment.db]

// Notify | UpdateState | Payout | OTP
const InitiatedByUser		= async function(ctxt)
{
	console.log('process-cargo-init', ctxt.Data)
	await Emit(Model.alerts.NewOrder, ctxt)

	await Task.Save(ctxt, Model.states.CargoInitiated)
	console.log('cargo-initialised', ctxt.Data)
}

const CancelledByUser		=  async function(ctxt)
{
	console.log('process-cargo-cancellation', ctxt.Data)
	await Emit(Model.alerts.Cancelled, ctxt)

	ctxt.Data.IsLive = false
	await Task.Save(ctxt, Model.states.CargoCancelled)

	await Task.PayOut(ctxt)

	await Task.ResetProduct(ctxt.Data.JournalID)

	console.log('cargo-cancelled', ctxt.Data)
}

const RejectedByStore		= async function(ctxt)
{
	console.log('process-order-rejection', ctxt.Data)
	await Emit(Model.alerts.Rejected, ctxt)

	ctxt.Data.IsLive = false
	await Task.Save(ctxt, Model.states.OrderRejected)

	await Task.PayOut(ctxt)

	await Task.ResetProduct(ctxt.Data.JournalID)

	console.log('order-rejected', ctxt.Data)
}

const ResendOTP			 	= async function(ctxt)
{
	console.log('resend-otp', { Transit: ctxt.Data })
	switch (ctxt.Data.State)
	{
		case Model.states.OrderDespatched:
			// To Authz-User
			ctxt.Data.User.Otp 	= await Task.SendOTP(ctxt.Data.User.MobileNo)
		break
		case Model.states.TransitAccepted:
			// To Authz@Shop
			ctxt.Data.Agent.Otp = await Task.SendOTP(ctxt.Data.Agent.MobileNo)			
		break
	}
	await db.transit.Save(ctxt.Data)	
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
	console.log('process-order-acceptance', ctxt.Data)
	await Emit(Model.alerts.Accepted, ctxt)	// To User: Emit irrespective of it turns to hold

	const agent = await db.agent.NearbyAgent(
			ctxt.Data.Store.Address.Longitude,
			ctxt.Data.Store.Address.Latitude)
	if(!agent)
	{
		console.log('no-agents-order-on-hold', ctxt.Data)
		await Task.PingAdmins(Model.states.OrderIgnored, ctxt)
		return
	}
	ctxt.Data.Agents = [ agent ]
	await Emit(Model.alerts.NewTransit, ctxt)	// To Agents

	await Task.Save(ctxt, Model.states.OrderAccepted)
	console.log('order-accepted-by-shop', ctxt.Data)
}

const ProcessedByStore			=  async function(ctxt)
{
	console.log('process-order-readiness', ctxt.Data)
	await Emit(Model.alerts.Processed, ctxt)

	await Task.Save(ctxt, Model.states.OrderProcessed)
	console.log('order-processed-by-shop', ctxt.Data)
}

const DespatchedByStore		= async function(ctxt)
{
	console.log('process-order-despatchment', ctxt.Data)
	await Task.ConfirmOTP(ctxt.Data.Agent.Otp, ctxt.Data.Store.Otp)
	
	await Emit(Model.alerts.EnRoute, ctxt)

	ctxt.Data.User.Otp 	= await Task.SendOTP(ctxt.Data.User.MobileNo)

		delete ctxt.Data.Agent.Otp
		delete ctxt.Data.Store.Otp
	await Task.Save(ctxt, Model.states.OrderDespatched)
	console.log('order-despatched', ctxt.Data)
}

const IgnoredByAgent		= async function(ctxt)
{
	for (idx = 0; idx < ctxt.Data.Agents.length; idx++) 
	{
		if (String(ctxt.Data.Agents[idx]._id) === String(ctxt.Data.Agent._id)) 
		{ ctxt.Data.Agents.pop(ctxt.Data.Agents[idx]); break }
	}
	if(!ctxt.Data.Agents.length)
	{
		console.log('on-hold-transit-ignored', ctxt.Data)
		await Task.PingAdmins(Model.states.TransitIgnored, ctxt)
		return	
	}
	Task.SetHistory(ctxt)
	ctxt.Data.Agent = Task.ResetAgent // Cleared temp data
	ctxt.Data.Event = ''
	await db.transit.Save(ctxt.Data)
}

const TimeoutByAgent		= async function(ctxt)
{
	await Task.Save(ctxt, Model.states.TransitTimeout)
}

const LockedByAdmin		= async function(ctxt)
{
	console.log('process-lock-by-admin', ctxt.Data)
	await Emit(Model.alerts.Locked, ctxt)

	let state_
	switch(ctxt.Data.State)
	{
		case Model.states.OrderIgnored	  : state_ = Model.states.OrderOnHold	  ; break
		case Model.states.TransitIgnored	  : state_ = Model.states.TransitOnHold ; break
		case Model.states.TransitAbandoned  : state_ = Model.states.TransitOnHold ; break
		// Accepted by agent then rejected and we could not filter new agent pool
	}

	ctxt.Data.Admins = []
	await Task.Save(ctxt, state_)
	console.log('transit-locked-by-admin', ctxt.Data)
}

const AssignedByAdmin		= async function(ctxt)
{
	console.log('agent-assignment-by-admin', ctxt.Data)

	const agent   = new Agent()
	const agent_  = await agent.Get(ctxt.Data.Agent.MobileNo, Model.query.ByMobileNo)
	if(!agent_) Err_(Model.code.NOT_FOUND, Model.reason.AgentNotFound)
	ctxt.Data.Agents = []
	ctxt.Data.Agent  = Task.SetAgent(agent_)

	await Emit(Model.alerts.Assigned,   ctxt)
	await Emit(Model.alerts.AgentReady, ctxt)

	// To Authz@Shop
	ctxt.Data.Agent.Otp = await Task.SendOTP(agent_.MobileNo)

	await Task.Save(ctxt, Model.states.TransitAccepted)
	console.log('agent-assigned-by-admin', ctxt.Data)
}

const TerminatedByAdmin		= async function(ctxt)
{
	console.log('process-termination-by-admin', ctxt.Data)
	await Emit(Model.alerts.Terminated, ctxt)

	ctxt.Data.IsLive = false
	await Task.Save(ctxt, Model.states.TransitTerminated)

	await Task.PayOut(ctxt) // ? Handle loops

	await Task.ResetProduct(ctxt.Data.JournalID)

	console.log('transit-completed', ctxt.Data)
}

const AcceptedByAgent		= async function(ctxt)
{
	console.log('process-transit-acceptace', ctxt.Data)
	await Emit(Model.alerts.AgentReady, ctxt)

	ctxt.Data.Agent.Otp = await Task.SendOTP(ctxt.Data.Agent.MobileNo)// To Authz@Shop
	ctxt.Data.Agents	= []
	
	await Task.Save(ctxt, Model.states.TransitAccepted)
	console.log('transit-accepted', ctxt.Data)
}

const RejectedByAgent		= async function(ctxt)
{
	switch(ctxt.Data.State)
	{
	case Model.states.TransitAccepted:

		const agent = await db.agent.NearbyAgent(
				ctxt.Data.Store.Address.Longitude,
				ctxt.Data.Store.Address.Latitude)
		if(!agent)
		{
			console.log('no-nearby-agents', ctxt.Data)
			await Task.PingAdmins(Model.states.TransitAbandoned, ctxt)
			return
		}
		// ? TODO Resolve the loop, 'auto cancel' on ultra delay
		// add faul rate idx for agent, record reasons as feedback
		// Create new state, Check delay, if it had grown high assign to admin
		// Then give admin an api to filter near by agents to that perticular store
		await Emit(Model.alerts.NewTransit, ctxt)
			ctxt.Data.Agents = [ agent ]
			ctxt.Data.Agent  = Task.ResetAgent
		await Task.Save(ctxt, Model.states.TransitRejected)
		return

	case Model.states.OrderDespatched:
		/** TO-DO: Set 911 ops */
		ctxt.Data.Agent = Task.ResetAgent
		await Task.Save(ctxt, Model.states.TransitOnDrift)
		return
	}
}

const CompletedByAgent		= async function(ctxt)
{
	console.log('process-transit-completion', ctxt.Data)
	await Task.ConfirmOTP(ctxt.Data.User.Otp, ctxt.Data.Agent.Otp)
	
	await Emit(Model.alerts.Delivered, ctxt)
		delete ctxt.Data.Agent.Otp
		delete ctxt.Data.User.Otp
		ctxt.Data.IsLive = false
	await Task.Save(ctxt, Model.states.TranistCompleted)

	await Task.PayOut(ctxt)
	console.log('transit-completed', ctxt.Data)
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