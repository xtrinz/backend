

const  otp 	 	= require('../../../infra/otp')
	, Model	 	= require('../../../sys/models')
	, journal	= require('../../run/journal/handlers')
	, Log  		= require('../../../sys/log')
	, history	= require('./history')
	, db 		= require('../../exports')[Model.segment.db]
	, { Emit } 	= require('./events')
	, Enter 	= require('../price/note')

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

const Post = async function(ctxt, state_)
{

	let book = await Enter(ctxt.JournalID, ctxt.Event)

	ctxt.Return = ctxt.State
	ctxt.State  = state_
	history.Set(ctxt)

	let event_  = ctxt.Event
	ctxt.Event  = ''		 // Clear it onlly after History & Ledger entry

	let upsert = (state_ === Model.states.Initiated)

	await db.transit.Save(ctxt, upsert)

	let jrnl =
	{
		Filter : { _id: ctxt.JournalID, 'Transit.State': ctxt.Return }
	  , Update : { }
	}

	let set = { 'Transit.State': state_ }
	if ( state_ == Model.states.Cancelled  || // For these Model.states PayOut
		 state_ == Model.states.Rejected   || // handle updates DB
		 state_ == Model.states.Terminated ||
		 state_ == Model.states.Completed  ||
		 event_ == Model.event.Assign	)
	{
		set.Agent =
		{
			  ID	   : ctxt.Agent.ID 
			, Name	   : ctxt.Agent.Name
			, MobileNo : ctxt.Agent.MobileNo  
		}
		if(ctxt.Event != Model.event.Assign)
		set[ 'Transit.Status' ] = Model.states.Closed
	}
	jrnl.Update[ '$set' ]  = set
	if(book.length) jrnl.Update[ '$push' ] = { Book: { $each: book }  }

	await db.journal.Update(jrnl)
}

const PingArbiter = async function(ctxt, st, alert_)
{
    Log('ping-arbiters', {State: st, Ctxt: ctxt})

	const arbiter = await db.arbiter.Nearby(
          ctxt.Seller.Address.Longitude
        , ctxt.Seller.Address.Latitude)
    ctxt.Arbiter 	= arbiter
    await Emit(alert_, ctxt)
    await Save(ctxt, st)
}

const ResetAgent = 
{   
	  ID   	   : '' 
	, Name 	   : '' 
	, MobileNo : '' 
}

const SetAgent   = async function(ctxt)
{
	const agent_  = await db.agent.Get(ctxt.Agent.MobileNo, Model.query.ByMobileNo)
	if(!agent_) 
	{
		Log('agent-does-not-exist', { Cxtx: ctxt })
		Model.Err_(Model.code.NOT_FOUND, Model.reason.AgentNotFound)
	}
	let now_ = new Date()
	if(!now_.is_today(agent_.Status.SetOn))
		 agent_.Status = Model.states.OffDuty
	else agent_.Status = agent_.Status.Current

	if(agent_.Status == Model.states.OffDuty)
	{
		Log('agent-is-not-online', { Cxtx: ctxt })
		Model.Err_(Model.code.NOT_FOUND, Model.reason.AgentNotAvailable)
	}
	let agent = 
	{
		ID  		: agent_._id
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
	, Post		, PingArbiter 	, ResetAgent
	, SetAgent	, ResetProduct
}