

const   otp 	    = require('../infra/otp')
	  , { Err_ }    = require('../system/models')
	  , Model	    = require('../system/models')
	  , { Journal } = require('../config/journal/driver')
	  , history 	= require('./history')
	  , db 			= require('../config/exports')[Model.segment.db]
	  , { Emit }	= require('./events')

// Notify | UpdateState | Payout | OTP

const PayOut	 = async function(ctxt)
{
	let journal = new Journal()
	await journal.PayOut(ctxt)
}

const ConfirmOTP = async function(o1, o2)
{
	const otp_ 	  = new otp.OneTimePasswd({MobileNo: '', Body: ''})
		, status_ = await otp_.Confirm(o1, o2)
	if  (!status_)  Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
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

	let upsert = (state_ === Model.states.CargoInitiated)

	await db.transit.Save(ctxt, upsert)

	if(!( state_ === Model.states.CargoCancelled 	  || // For these Model.states PayOut
		  state_ === Model.states.OrderRejected 	  || // handle updates DB
		  state_ === Model.states.TransitTerminated ||
		  state_ === Model.states.TranistCompleted  ))
	await db.journal.Save({ _id: ctxt.JournalID, 'Transit.State': state_ })
}

const PingAdmins = async function(st, ctxt)
{
    console.log('ping-admins', {State: st, Ctxt: ctxt})

	const admins  = await db.user.NearbyAdmins(
          ctxt.Store.Address.Longitude
        , ctxt.Store.Address.Latitude)
    ctxt.Admins = admins
    await Emit(alerts.NoAgents, ctxt)
    await Save(ctxt, st)
}

const ResetAgent = 
{   _id  : '' , SockID   : []
, Name : '' , MobileNo : '' }

const SetAgent   = function(agent_)
{
	return {  _id 	: agent_._id  , SockID   : agent_.SockID
		, Name	: agent_.Name , MobileNo : agent_.MobileNo  }
}

const ResetProduct = async function(Journal_id)
{
	console.log('reset-product-count-on-order-diffusion', { JournalID: Journal_id })
	let journal_ = await db.journal.Get(Journal_id, Model.query.ByID)
	await db.product.IncProdCount(journal_.Order.Products)
}

module.exports =
{
      PayOut       : PayOut
    , ConfirmOTP   : ConfirmOTP
    , SendOTP      : SendOTP
    , Save         : Save
    , PingAdmins   : PingAdmins
    , ResetAgent   : ResetAgent
	, SetAgent 	   : SetAgent
	, ResetProduct : ResetProduct
}