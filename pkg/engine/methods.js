
const { Emit }  = require('./events')
	, Model 	= require('../system/models')
	, Task 	   	= require('./helper')
	, db        = require('../config/exports')[Model.segment.db]

// Notify | UpdateState | Payout | OTP
const Init		= async function(ctxt)
{
	console.log('process-cargo-init', ctxt)
	await Emit(Model.alerts.NewOrder, ctxt)

	await Task.Save(ctxt, Model.states.Initiated)
	console.log('cargo-initialised', ctxt)

}

const Cancel	=  async function(ctxt)
{
	console.log('process-cargo-cancellation', ctxt)
	await Emit(Model.alerts.Cancelled, ctxt)

	ctxt.IsLive = false
	await Task.Save(ctxt, Model.states.Cancelled)

	await Task.PayOut(ctxt)

	await Task.ResetProduct(ctxt.JournalID)

	console.log('cargo-cancelled', ctxt)
}

const Reject		= async function(ctxt)
{
	console.log('process-order-rejection', ctxt)
	await Emit(Model.alerts.Rejected, ctxt)

	ctxt.IsLive = false
	await Task.Save(ctxt, Model.states.Rejected)

	await Task.PayOut(ctxt)

	await Task.ResetProduct(ctxt.JournalID)

	console.log('order-rejected', ctxt)
}

const OTP			 	= async function(ctxt)
{
	console.log('resend-otp', { Transit: ctxt })
	switch (ctxt.State)
	{
		// To Authz-User
		case Model.states.Despatched:
		ctxt.User.Otp  = await Task.SendOTP(ctxt.User.MobileNo)
		break
		// To Authz@Shop
		case Model.states.Assigned:
		ctxt.Agent.Otp = await Task.SendOTP(ctxt.Agent.MobileNo)			
		break
	}
	await db.transit.Save(ctxt)	
}

const Accept			=  async function(ctxt)
{
	console.log('process-order-acceptance', ctxt)
	await Emit(Model.alerts.Accepted, ctxt)	// To User: Emit irrespective of it turns to hold

	const agent = await db.agent.NearbyAgent(
			ctxt.Store.Address.Longitude,
			ctxt.Store.Address.Latitude)				// TODO set filed for not in list
	if(!agent)
	{
		console.log('no-agents-order-on-hold', ctxt)
		await Task.PingAdmin(ctxt
			, Model.states.OnHold
			, Model.alerts.NoAgents)
		return
	}
	ctxt.Agent = agent
	await Emit(Model.alerts.NewTransit, ctxt)	// To Agents

	await Task.Save(ctxt, Model.states.Assigned)
	console.log('order-accepted-by-shop', ctxt)
}

const Ignore		= async function(ctxt)
{
	console.log('on-hold-transit-ignored', ctxt)

	await Task.PingAdmin(ctxt
		, Model.states.OnHold
		, Model.alerts.NoAgents)
}

const Ready			=  async function(ctxt)
{
	console.log('process-order-readiness', ctxt)

	await Emit(Model.alerts.Processed, ctxt)

	console.log('order-processed-by-shop', ctxt)
}

const Despatch		= async function(ctxt)
{
	console.log('process-order-despatchment', ctxt)
	await Task.ConfirmOTP(ctxt.Agent.Otp, ctxt.Store.Otp)
	
	await Emit(Model.alerts.EnRoute, ctxt)

	ctxt.User.Otp 	= await Task.SendOTP(ctxt.User.MobileNo)

		delete ctxt.Agent.Otp
		delete ctxt.Store.Otp
	await Task.Save(ctxt, Model.states.Despatched)
	console.log('order-despatched', ctxt)
}

const Assign		= async function(ctxt)
{
	console.log('agent-assignment-by-admin', ctxt)

	ctxt.Agent  = await Task.SetAgent(ctxt)

	await Emit(Model.alerts.Assigned,   ctxt)
	await Emit(Model.alerts.AgentReady, ctxt)

	// To Authz@Shop
	ctxt.Agent.Otp = await Task.SendOTP(agent_.MobileNo)

	await Task.Save(ctxt, Model.states.Accepted)
	console.log('agent-assigned-by-admin', ctxt)
}

const Terminate		= async function(ctxt)
{
	console.log('process-termination-by-admin', ctxt)
	await Emit(Model.alerts.Terminated, ctxt)

	ctxt.IsLive = false
	await Task.Save(ctxt, Model.states.Terminated)

	await Task.PayOut(ctxt) // ? Handle loops

	await Task.ResetProduct(ctxt.JournalID)

	console.log('transit-completed', ctxt)
}

const Commit		= async function(ctxt)
{
	console.log('process-transit-acceptace', ctxt)
	await Emit(Model.alerts.AgentReady, ctxt)

	// To Authz@Shop
	ctxt.Agent.Otp = await Task.SendOTP(ctxt.Agent.MobileNo)
	
	await Task.Save(ctxt, Model.states.Accepted)
	console.log('transit-accepted', ctxt)
}

const Quit		= async function(ctxt)
{
	console.log('no-nearby-agents', ctxt)

	await Task.PingAdmin(ctxt
		, Model.states.OnHold
		, Model.alerts.NoAgents) // change alert
}

const Complete		= async function(ctxt)
{
	console.log('process-transit-completion', ctxt)
	await Task.ConfirmOTP(ctxt.User.Otp, ctxt.Agent.Otp)
	
	await Emit(Model.alerts.Delivered, ctxt)
		delete ctxt.Agent.Otp
		delete ctxt.User.Otp
		ctxt.IsLive = false
	await Task.Save(ctxt, Model.states.Completed)

	await Task.PayOut(ctxt)
	console.log('transit-completed', ctxt)
}

module.exports = 
{
	Init,		Cancel,		Reject,
	Accept,		Ignore,		Assign,
	Ready,		Terminate,	Commit,
	Despatch,	Quit,		Complete,
	OTP
}