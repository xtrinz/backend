

const  otp 	 	= require('../infra/otp')
	, Model	 	= require('../system/models')
	, journal	= require('../config/journal/handlers')
	, history	= require('./history')
	, db 		= require('../config/exports')[Model.segment.db]
	, { Emit } 	= require('./events')
	, { Log } 	= require('../system/log')

// Notify | UpdateState | Payout | OTP

const PayOut	 = async function(ctxt)
{
	await journal.Payout(ctxt)
}

const ConfirmOTP = async function(o1, o2)
{
	const otp_ 	  = new otp.OneTimePasswd({MobileNo: '', Body: ''})
		, status_ = await otp_.Confirm(o1, o2)
	if  (!status_)  Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
}

const SendOTP 	 = async function(mobile_no)
{
	let otp_sms = new otp.OneTimePasswd(
		{ MobileNo : 	mobile_no, 
		  Body  : 	Model.message.ForPkg })
		, hash 		= await otp_sms.Send(Model.gw.SMS)
	return hash
}

const Save = async function(ctxt, state_)
{
	ctxt.Return = ctxt.State
	ctxt.State  = state_
	history.Set(ctxt)
	// Clear Event Only After History Update
	ctxt.Event  = ''

	let upsert = (state_ === Model.states.Initiated)

	await db.transit.Save(ctxt, upsert)

	if(!( state_ === Model.states.Cancelled  || // For these Model.states PayOut
		  state_ === Model.states.Rejected 	 || // handle updates DB
		  state_ === Model.states.Terminated ||
		  state_ === Model.states.Completed  ))
	await db.journal.Save({ _id: ctxt.JournalID, 'Transit.State': state_ })
}

const PingAdmin = async function(ctxt, st, alert_)
{
    Log('ping-admins', {State: st, Ctxt: ctxt})

	const admin = await db.admin.Nearby(
          ctxt.Store.Address.Longitude
        , ctxt.Store.Address.Latitude)
    ctxt.Admin 	= admin
    await Emit(alert_, ctxt)
    await Save(ctxt, st)
}

const ResetAgent = 
{   
	  _id  	   : '' 
	, SockID   : []
	, Name 	   : '' 
	, MobileNo : '' 
}

const SetAgent   = async function(ctxt)
{
	const agent_  = await db.agent.Get(ctxt.Agent.MobileNo, Model.query.ByMobileNo)
	if(!agent_) Model.Err_(Model.code.NOT_FOUND, Model.reason.AgentNotFound)
	
	let agent = 
	{
		_id 		: agent_._id
	  , SockID   	: agent_.SockID
	  , Name		: agent_.Name
	  , MobileNo 	: agent_.MobileNo  
	}
	return agent
}

const ResetProduct = async function(Journal_id)
{
	Log('reset-product-count-on-order-diffusion', { JournalID: Journal_id })
	let journal_ = await db.journal.Get(Journal_id, Model.query.ByID)
	await db.product.IncProdCount(journal_.Order.Products)
}

module.exports =
{
      PayOut	, ConfirmOTP	, SendOTP
	, Save		, PingAdmin 	, ResetAgent
	, SetAgent	, ResetProduct
}