const   otp 				 	 = require('../infra/otp')
	  , { Err_ , code, reason }  = require('../common/error')
	  , { message, gw }          = require('../common/models')
	  , { Journal } 		 	 = require('../config/journal/driver')
	  , db 						 = 
	  {
			  transit 			 : require('../config/transit/archive')
			, user 				 : require('../config/user/archive')
	  }

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
	if  (!status_)  Err_(code.BAD_REQUEST, reason.OtpRejected)
}

const SendOTP 	 = async function(mobile_no)
{
	let otp_sms = new otp.OneTimePasswd(
		{ MobileNo : 	mobile_no, 
		  Body  : 	message.ForPkg })
		, hash 		= await otp_sms.Send(gw.SMS)
	return hash
}

const Save = async function(ctxt, state_)
{
	ctxt.Data.Return = ctxt.Data.State
	ctxt.Data.State  = state_
	ctxt.Data.Event  = ''
	ctxt.Data.StateHistory.push(state_) 
	await db.transit.Save(ctxt.Data)
}

const PingAdmins = async function(st, ctxt)
{
    console.log('ping-admins', {State: st, Ctxt: ctxt})

	const admins  = await db.user.NearbyAdmins(
          ctxt.Data.Store.Longitude
        , ctxt.Data.Store.Latitude)
    ctxt.Data.Admins = admins
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

module.exports =
{
      PayOut      : PayOut
    , ConfirmOTP  : ConfirmOTP
    , SendOTP     : SendOTP
    , Save        : Save
    , PingAdmins  : PingAdmins
    , ResetAgent  : ResetAgent
	, SetAgent 	  : SetAgent
}