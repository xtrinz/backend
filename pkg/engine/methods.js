const   { Emit } 			   = require("./events")
	  , otp 				   = require("../common/otp")
	  , { Err_, code, reason } = require("../common/error")
	  , { states, alerts }	   = require("../common/models")
	  , { User } 			   = require("../objects/user")
	  , { Journal } 		   = require("../objects/journal")

// Notify | UpdateState | Payout | OTP

const Save = async function(ctxt, state_)
{
	ctxt.Data.Return = ctxt.Data.State
	ctxt.Data.State  = state_
	ctxt.Data.Event  = ""
	await ctxt.Save()
}

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

	let journal = new Journal()
	await journal.PayOut(ctxt)
	console.log('cargo-cancelled', ctxt.Data)
}

const RejectedByStore		= async function(ctxt)
{
	console.log('process-order-rejection', ctxt.Data)
	await Emit(alerts.Rejected, ctxt)
	ctxt.Data.IsLive = false
	await Save(ctxt, states.OrderRejected)
	let journal = new Journal()
	await journal.PayOut(ctxt)
	console.log('order-rejected', ctxt.Data)
}

const TimeoutByStore		= async function(ctxt)
{
	await Save(ctxt, states.TransitAcceptanceTimeout)
}

const AcceptedByStore			=  async function(ctxt)
{
	console.log('process-order-acceptance', ctxt.Data)

	// must alert irrespective of transit get holded or not
	await Emit(alerts.Accepted, ctxt)	// To User

	const agent  = new User()
	const agents = await agent.NearbyAgents(
			ctxt.Data.Store.Longitude,
			ctxt.Data.Store.Latitude)
	if(!agents)
	{
		console.log('no-agents-order-on-hold', ctxt.Data)
		const admin   = new User()
		const admins  = await admin.NearbyAdmins(
				ctxt.Data.Store.Longitude,
				ctxt.Data.Store.Latitude)
		await Emit(alerts.NoAgents, ctxt)
		
		ctxt.Data.Admins = admins
		await Save(ctxt, states.OrderIgnored)
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

	const otp_ 	  = new otp.OneTimePasswd({MobNo: "", Body: ""})
		, status_ = await otp_.Confirm(ctxt.Data.Agent.Otp, ctxt.Data.Store.Otp)
	if  (!status_)  Err_(code.BAD_REQUEST, reason.OtpRejected)

	await Emit(alerts.EnRoute, ctxt)
	let otp_sms   = new otp.OneTimePasswd(
		{
			MobNo: 	ctxt.Data.User.MobileNo, 
			Body: 	otp.Msgs.ForPkg
		})
	  , hash 	  = await otp_sms.Send(otp.Opts.SMS)

	delete ctxt.Data.Agent.Otp
	delete ctxt.Data.Store.Otp
	ctxt.Data.User.Otp 	= hash
	await Save(ctxt, states.OrderDespatched)
	console.log('order-despatched', ctxt.Data)
}

const IgnoredByAgent		= async function(ctxt)
{
	for (idx = 0; idx < ctxt.Data.Agents.length; idx++) 
	{
		let agent = ctxt.Data.Agents[idx]
		if (String(agent._id) === String(ctxt.Data.Agent._id)) 
			{ ctxt.Data.Agents.pop(agent); break }
	}
	if(!ctxt.Data.Agents.length)
	{
		console.log('on-hold-agents-ignored-the-tranist', ctxt.Data)
		const admin   = new User()
		const admins  = await admin.NearbyAdmins(
				ctxt.Data.Store.Longitude,
				ctxt.Data.Store.Latitude)
		ctxt.Data.Admins = admins
		await Emit(alerts.NoAgents, ctxt)
		await Save(ctxt, states.TransitIgnored)
		return	
	}
	delete 	ctxt.Data.Agent
			ctxt.Data.Event  = ""
	await ctxt.Save()
}

const TimeoutByAgent		= async function()
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
		case states.OrderIgnored	 :
			state_ = states.OrderOnHold	  ; break
		case states.TransitIgnored	 :
			state_ = states.TransitOnHold ; break
		case states.TransitAbandoned :
			state_ = states.TransitOnHold ; break
	}

	ctxt.Data.Admins = []
	await Save(ctxt, state_)
	console.log('transit-locked-by-admin', ctxt.Data)
}

const AcceptedByAgent		= async function(ctxt)
{
	console.log('process-transit-acceptace', ctxt.Data)

	await Emit(alerts.AgentReady, ctxt)
	let   otp_sms 	= new otp.OneTimePasswd(
		{
			MobNo: 	ctxt.Data.Agent.MobileNo,	// To Authz@Shop 
			Body: 	otp.Msgs.ForPkg
		})
		, hash 		= await otp_sms.Send(otp.Opts.SMS)

	ctxt.Data.Agent.Otp = hash
	ctxt.Data.Agents	= []
	await Save(ctxt, states.TransitAccepted)
	console.log('transit-accepted', ctxt.Data)
}

const RejectedByAgent		= async function(ctxt)
{
	// ? Agent History
	switch(ctxt.State)
	{
	case states.TransitAccepted:
		const agent  = new User()
		const agents = await agent.NearbyAgents(
				ctxt.Data.Store.Longitude,
				ctxt.Data.Store.Latitude)
		if(!agents.length)
		{
			console.log('no-nearby-agents', ctxt.Data)
			const admin   = new User()
			const admins  = await admin.NearbyAdmins(
					ctxt.Data.Store.Longitude,
					ctxt.Data.Store.Latitude)
			ctxt.Data.Admins = admins
			await Emit(alerts.NoAgents, ctxt)
			await Save(ctxt, states.TransitAbandoned)
			return
		}
		await Emit(alerts.NewTransit, ctxt)
		break
	case states.OrderDespatched:
	}
	delete ctxt.Agent
	await Save(ctxt, states.TransitRejected)
}

const CompletedByAgent		= async function(ctxt)
{
	console.log('process-transit-completion', ctxt.Data)

	const otp_    = new otp.OneTimePasswd({MobNo: "", Body: ""})
	const status_ = await otp_.Confirm(ctxt.Data.User.Otp, ctxt.Data.Agent.Otp)
	if (!status_) Err_(code.BAD_REQUEST, reason.OtpRejected)

	await Emit(alerts.Delivered, ctxt)
	delete ctxt.Data.Agent.Otp
	delete ctxt.Data.User.Otp
	ctxt.Data.IsLive = false
	await Save(ctxt, states.TranistCompleted)

	let journal = new Journal()
	await journal.PayOut(ctxt)
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
	CompletedByAgent  : CompletedByAgent
}