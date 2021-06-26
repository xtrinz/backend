const   { Emit } 			 	   = require('./events')
	  , { Err_ , code, reason }    = require('../common/error')
	  , { states , alerts, query } = require('../common/models')
	  , { User } 			 	   = require('../objects/user')
	  , { PayOut , SendOTP, Save, SetAgent
		, ConfirmOTP, ResetAgent } = require('./wrap')

// Notify | UpdateState | Payout | OTP
const InitiatedByUser		= async function(ctxt)
{
	console.log('process-cargo-init', ctxt.Data)
	await Emit(alerts.NewOrder, ctxt)

	await Save(ctxt, states.CargoInitiated)
	console.log('cargo-initialised', ctxt.Data)
}

const CancelledByUser		=  async function(ctxt)
{
	console.log('process-cargo-cancellation', ctxt.Data)
	await Emit(alerts.Cancelled, ctxt)

	ctxt.Data.IsLive = false
	await Save(ctxt, states.CargoCancelled)

	await PayOut(ctxt)
	console.log('cargo-cancelled', ctxt.Data)
}

const RejectedByStore		= async function(ctxt)
{
	console.log('process-order-rejection', ctxt.Data)
	await Emit(alerts.Rejected, ctxt)

	ctxt.Data.IsLive = false
	await Save(ctxt, states.OrderRejected)

	await PayOut(ctxt)
	console.log('order-rejected', ctxt.Data)
}

const TimeoutByStore		= async function(ctxt)
{
	await Save(ctxt, states.TransitAcceptanceTimeout)
}

const AcceptedByStore			=  async function(ctxt)
{
	console.log('process-order-acceptance', ctxt.Data)
	await Emit(alerts.Accepted, ctxt)	// To User: Emit irrespective of it turns to hold

	const agent  = new User()
	const agents = await agent.NearbyAgents(
			ctxt.Data.Store.Longitude,
			ctxt.Data.Store.Latitude)
	if(!agents)
	{
		console.log('no-agents-order-on-hold', ctxt.Data)
		await PingAdmins(states.OrderIgnored, ctxt)
		return
	}
	ctxt.Data.Agents = agents
	await Emit(alerts.NewTransit, ctxt)	// To Agents

	await Save(ctxt, states.OrderAccepted)
	console.log('order-accepted-by-shop', ctxt.Data)
}

const DespatchedByStore		= async function(ctxt)
{
	console.log('process-order-despatchment', ctxt.Data)
	await ConfirmOTP(ctxt.Data.Agent.Otp, ctxt.Data.Store.Otp)
	
	await Emit(alerts.EnRoute, ctxt)

	ctxt.Data.User.Otp 	= await SendOTP(ctxt.Data.User.MobileNo)

		delete ctxt.Data.Agent.Otp
		delete ctxt.Data.Store.Otp
	await Save(ctxt, states.OrderDespatched)
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
		await PingAdmins(states.TransitIgnored, ctxt)
		return	
	}
	ctxt.Data.Agent = ResetAgent
	ctxt.Data.Event = ''
	await ctxt.Save()
}

const TimeoutByAgent		= async function(ctxt)
{
	await Save(ctxt, states.TransitTimeout)
}

const LockedByAdmin		= async function(ctxt)
{
	console.log('process-lock-by-admin', ctxt.Data)
	await Emit(alerts.Locked, ctxt)

	let state_
	switch(ctxt.Data.State)
	{
		case states.OrderIgnored	  : state_ = states.OrderOnHold	  ; break
		case states.TransitIgnored	  : state_ = states.TransitOnHold ; break
		case states.TransitAbandoned  : state_ = states.TransitOnHold ; break
		// Accepted by agent then rejected and we could not filter new agent pool
	}

	ctxt.Data.Admins = []
	await Save(ctxt, state_)
	console.log('transit-locked-by-admin', ctxt.Data)
}

const AssignedByAdmin		= async function(ctxt)
{
	console.log('agent-assignment-by-admin', ctxt.Data)

	const agent   = new User()
	const agent_  = await agent.Get(ctxt.Data.Agent.MobileNo, query.ByMobNo)
	if(!agent_) Err_(code.NOT_FOUND, reason.AgentNotFound)
	ctxt.Data.Agents = []
	ctxt.Data.Agent  = SetAgent(agent_)

	await Emit(alerts.Assigned,   ctxt)
	await Emit(alerts.AgentReady, ctxt)

	// To Authz@Shop
	ctxt.Data.Agent.Otp = await SendOTP(agent_.MobNo)

	await Save(ctxt, states.TransitAccepted)
	console.log('agent-assigned-by-admin', ctxt.Data)
}

const TerminatedByAdmin		= async function(ctxt)
{
	console.log('process-termination-by-admin', ctxt.Data)
	await Emit(alerts.Terminated, ctxt)

	ctxt.Data.IsLive = false
	await Save(ctxt, states.TransitTerminated)

	await PayOut(ctxt) // ? Handle loops
	console.log('transit-completed', ctxt.Data)
}

const AcceptedByAgent		= async function(ctxt)
{
	console.log('process-transit-acceptace', ctxt.Data)
	await Emit(alerts.AgentReady, ctxt)

	ctxt.Data.Agent.Otp = await SendOTP(ctxt.Data.Agent.MobileNo)// To Authz@Shop
	ctxt.Data.Agents	= []
	
	await Save(ctxt, states.TransitAccepted)
	console.log('transit-accepted', ctxt.Data)
}

const RejectedByAgent		= async function(ctxt)
{
	// ? Agent History
	switch(ctxt.Data.State)
	{
	case states.TransitAccepted:
		const agent  = new User()
		const agents = await agent.NearbyAgents(
				ctxt.Data.Store.Longitude,
				ctxt.Data.Store.Latitude)
		if(!agents)
		{
			console.log('no-nearby-agents', ctxt.Data)
			await PingAdmins(states.TransitAbandoned, ctxt)
			return
		}
		// ? TODO Resolve the loop
		await Emit(alerts.NewTransit, ctxt)
			ctxt.Data.Agents = agents
			ctxt.Data.Agent  = ResetAgent
		await Save(ctxt, states.TransitRejected)
		return

	case states.OrderDespatched:
		/** TODO: Set 911 ops */
		ctxt.Data.Agent = ResetAgent
		await Save(ctxt, states.TransitOnDrift)
		return
	}
}

const CompletedByAgent		= async function(ctxt)
{
	console.log('process-transit-completion', ctxt.Data)
	await ConfirmOTP(ctxt.Data.User.Otp, ctxt.Data.Agent.Otp)
	
	await Emit(alerts.Delivered, ctxt)
		delete ctxt.Data.Agent.Otp
		delete ctxt.Data.User.Otp
		ctxt.Data.IsLive = false
	await Save(ctxt, states.TranistCompleted)

	await PayOut(ctxt)
	console.log('transit-completed', ctxt.Data)
}

module.exports = 
{
	InitiatedByUser	  : InitiatedByUser,
	CancelledByUser	  : CancelledByUser,
	RejectedByStore	  : RejectedByStore,
	TimeoutByStore	  : TimeoutByStore,
	AcceptedByStore	  : AcceptedByStore,
	DespatchedByStore : DespatchedByStore,
	IgnoredByAgent	  : IgnoredByAgent,
	LockedByAdmin	  : LockedByAdmin,
	TimeoutByAgent 	  : TimeoutByAgent,
	AcceptedByAgent	  : AcceptedByAgent,
	RejectedByAgent	  : RejectedByAgent,
	AssignedByAdmin   : AssignedByAdmin,
	TerminatedByAdmin : TerminatedByAdmin,
	CompletedByAgent  : CompletedByAgent
}