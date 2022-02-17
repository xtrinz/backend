
const { Emit } = require('./events')
	, Model    = require('../../../sys/models')
	, Task 	   = require('./helper')
	, db       = require('../../exports')[Model.segment.db]
	, Log 	   = require('../../../sys/log')
	, s = Model.states, a = Model.alerts

// Notify | UpdateState | Payout | OTP
const Init		= async function(ctxt)
{
	Log('process-cargo-init', ctxt)
	await Emit(a.NewOrder, ctxt)

	await Task.Post(ctxt, s.Initiated)
	Log('cargo-initialised', ctxt)

}

const Cancel	=  async function(ctxt)
{
	Log('process-cargo-cancellation', ctxt)
	await Emit(a.Cancelled, ctxt)

	await Task.Post(ctxt, s.Cancelled)

	await Task.PayOut(ctxt) // After Save, Always

	await Task.ResetProduct(ctxt.JournalID)

	Log('cargo-cancelled', ctxt)
}

const Reject		= async function(ctxt)
{
	Log('process-order-rejection', ctxt)
	await Emit(a.Rejected, ctxt)

	await Task.Post(ctxt, s.Rejected)

	await Task.PayOut(ctxt) // After Save, Always

	await Task.ResetProduct(ctxt.JournalID)

	Log('order-rejected', ctxt)
}

const OTP			 	= async function(ctxt)
{
	Log('resend-otp', { Transit: ctxt })
	switch (ctxt.State)
	{
		// To Authz-Client
		case s.Despatched: ctxt.Client.Otp  = await Task.SendOTP(ctxt.Client.MobileNo); break
		// To Authz@Shop
		case s.Assigned: ctxt.Agent.Otp = await Task.SendOTP(ctxt.Agent.MobileNo); break
	}
	await db.transit.Save(ctxt)	
}

const Accept			=  async function(ctxt)
{
	Log('process-order-acceptance', ctxt)
	await Emit(a.Accepted, ctxt)	// To Client: Emit irrespective of it turns to hold

	const agent = await db.agent.Nearby(
			ctxt.Seller.Address.Longitude,
			ctxt.Seller.Address.Latitude)				// TODO set filed for not in list
	if(!agent)
	{
		Log('no-agents-order-on-hold', ctxt)
		await Task.PingArbiter(ctxt, s.OnHold, a.NoAgents)
		return
	}
	ctxt.Agent = agent
	await Emit(a.NewTransit, ctxt)	// To Agents

	await Task.Post(ctxt, s.Assigned)
	Log('order-accepted-by-shop', ctxt)
}

const Ignore		= async function(ctxt)
{
	Log('on-hold-transit-ignored', ctxt)

	await Task.PingArbiter(ctxt, s.OnHold, a.NoAgents)
}

const Ready			=  async function(ctxt)
{
	Log('process-order-readiness', ctxt)

	await Emit(a.Processed, ctxt)

	Log('order-processed-by-shop', ctxt)
}

const Despatch		= async function(ctxt)
{
	Log('process-order-despatchment', ctxt)
	await Task.ConfirmOTP(ctxt.Agent.Otp, ctxt.Seller.Otp)
	
	await Emit(a.EnRoute, ctxt)

	ctxt.Client.Otp = await Task.SendOTP(ctxt.Client.MobileNo)

		delete ctxt.Agent.Otp
		delete ctxt.Seller.Otp
	await Task.Post(ctxt, s.Despatched)
	Log('order-despatched', ctxt)
}

const Assign		= async function(ctxt)
{
	Log('agent-assignment-by-arbiter', ctxt)

	ctxt.Agent  = await Task.SetAgent(ctxt)

	await Emit(a.Assigned,   ctxt)
	await Emit(a.AgentReady, ctxt)

	// To Authz@Shop
	ctxt.Agent.Otp = await Task.SendOTP(ctxt.Agent.MobileNo)

	await Task.Post(ctxt, s.Accepted)
	Log('agent-assigned-by-arbiter', ctxt)
}

const Terminate		= async function(ctxt)
{
	Log('process-termination-by-arbiter', ctxt)
	await Emit(a.Terminated, ctxt)

	await Task.Post(ctxt, s.Terminated)

	await Task.PayOut(ctxt) // ? Handle loops // After Save, Always

	await Task.ResetProduct(ctxt.JournalID)

	Log('transit-completed', ctxt)
}

const Commit		= async function(ctxt)
{
	Log('process-transit-acceptace', ctxt)
	await Emit(a.AgentReady, ctxt)

	// To Authz@Shop
	ctxt.Agent.Otp = await Task.SendOTP(ctxt.Agent.MobileNo)
	
	await Task.Post(ctxt, s.Accepted) 
	Log('transit-accepted', ctxt)
}

const Quit		= async function(ctxt)
{
	Log('no-nearby-agents', ctxt)

	await Task.PingArbiter(ctxt, s.OnHold, a.NoAgents) // change alert
}

const Complete		= async function(ctxt)
{
	Log('process-transit-completion', ctxt)
	await Task.ConfirmOTP(ctxt.Client.Otp, ctxt.Agent.Otp)
	
	await Emit(a.Delivered, ctxt)
		delete ctxt.Agent.Otp
		delete ctxt.Client.Otp

	await Task.Post(ctxt, s.Completed)

	await Task.PayOut(ctxt) // After Save, Always
	Log('transit-completed', ctxt)
}

module.exports = 
{
	Init,		Cancel,		Reject,
	Accept,		Ignore,		Assign,
	Ready,		Terminate,	Commit,
	Despatch,	Quit,		Complete,
	OTP
}