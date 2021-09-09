const   otp 				 	 = require('../infra/otp')
	  , { Err_ , code, reason, mode,
		  message, gw, event }  = require('../system/models')
	  , { Journal } 		 	 = require('../config/journal/driver')
	  , db 						 = 
	  {
			  transit 			 : require('../config/transit/archive')
			, user 				 : require('../config/user/archive')
	  }

// Notify | UpdateState | Payout | OTP

const SetHistory = async function(ctxt)
{
	let rcd =
	{
		  Index		: ctxt.Data.History.length + 1
		, Time		: Date(Date.now()).toString()
		, Event 	: ctxt.Data.Event
		, State 	:
		{
		  Start 	: ctxt.Data.Return
		, End   	: ctxt.Data.State
		, HasChange : (ctxt.Data.Return === ctxt.Data.State)? false : true
		}
		, Subject	:
		{
			  Type 	: ''
			, UID	: ''
			, Name  : ''
		}
	}
	switch (ctxt.Data.Event)
	{
		case event.InitiationByUser:
			rcd.Subject =
			{
				  Type 	: mode.Paytm
				, UID	: ctxt.Data.JournalID
				, Name  : 'Journal'
			}
			break
		case event.CancellationByUser:
			rcd.Subject =
			{
				  Type 	: mode.User
				, UID	: ctxt.Data.User._id
				, Name  : ctxt.Data.User.Name
			}
			break
		case event.RejectionByStore:
			rcd.Subject =
			{
				  Type 	: mode.Store
				, UID	: ctxt.Data.Store._id
				, Name  : ctxt.Data.Store.Name
			}
			break
		case event.TimeoutByStore:
			rcd.Subject =
			{
				  Type 	: mode.System
				, UID	: ''
				, Name  : mode.System
			}
			break
		case event.AcceptanceByStore:
			rcd.Subject =
			{
				  Type 	: mode.Store
				, UID	: ctxt.Data.Store._id
				, Name  : ctxt.Data.Store.Name
			}
			break
		case event.DespatchmentByStore:
			rcd.Subject =
			{
				  Type 	: mode.Store
				, UID	: ctxt.Data.Store._id
				, Name  : ctxt.Data.Store.Name
			}
			break
		case event.IgnoranceByAgent:
			rcd.Subject =
			{
				  Type 	: mode.Agent // TODO Not passed to Save Wrapper
				, UID	: ''		 // handle it within its handler
				, Name  : ''
			}
			break
		case event.LockByAdmin:
			rcd.Subject =
			{
				  Type 	: mode.Admin
				, UID	: ctxt.Data.Admin._id
				, Name  : ctxt.Data.Admin.Name
			}
			break
		case event.AssignmentByAdmin:
			rcd.Subject =
			{
				  Type 	: mode.Admin
				, UID	: ctxt.Data.Admin._id
				, Name  : ctxt.Data.Admin.Name
			}
			break
		case event.TerminationByAdmin:
			rcd.Subject =
			{
				  Type 	: mode.Admin
				, UID	: ctxt.Data.Admin._id
				, Name  : ctxt.Data.Admin.Name
			}
			break
		case event.ScheduleByAdmin:
			rcd.Subject =
			{
				  Type 	: mode.Admin
				, UID	: ctxt.Data.Admin._id
				, Name  : ctxt.Data.Admin.Name
			}
			break
		case event.TimeoutByAgent:
			rcd.Subject =
			{
				  Type 	: mode.System
				, UID	: ''
				, Name  : mode.System
			}
			break
		case event.RefeedByAdmin:
			rcd.Subject =
			{
				  Type 	: mode.Admin
				, UID	: ctxt.Data.Admin._id
				, Name  : ctxt.Data.Admin.Name
			}
			break
		case event.AcceptanceByAgent:
			rcd.Subject =
			{
				  Type 	: mode.Agent
				, UID	: ctxt.Data.Agent._id
				, Name  : ctxt.Data.Agent.Name
			}
			break
		case event.RejectionByAgent:
			rcd.Subject =
			{
				  Type 	: mode.Agent
				, UID	: ctxt.Data.Agent._id
				, Name  : ctxt.Data.Agent.Name
			}
			break
		case event.CompletionByAgent:
			rcd.Subject =
			{
				  Type 	: mode.Agent
				, UID	: ctxt.Data.Agent._id
				, Name  : ctxt.Data.Agent.Name
			}
			break
		case event.ResendOTP:
			rcd.Subject =
			{
				  Type 	: mode.Agent
				, UID	: ctxt.Data.Agent._id
				, Name  : ctxt.Data.Agent.Name
			}
			break
	}
	ctxt.Data.History.push(rcd)
}

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
	SetHistory(ctxt)
	// Clear Event After History Update
	ctxt.Data.Event  = ''
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