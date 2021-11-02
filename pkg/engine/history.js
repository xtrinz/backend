

const  Model	    = require('../system/models')

const Set = async function(ctxt)
{
	let rcd =
	{
		  Index		: ctxt.History.length + 1
		, Time		: Date(Date.now()).toString()
		, Event 	: ctxt.Event
		, State 	:
		{
		  Start 	: ctxt.Return
		, End   	: ctxt.State
		, HasChange : (ctxt.Return === ctxt.State)? false : true
		}
		, Subject	:
		{
			  Type 	: ''
			, UID	: ''
			, Name  : ''
		}
	}
	switch (ctxt.Event)
	{
		case Model.event.InitiationByUser:
			rcd.Subject =
			{
				  Type 	: Model.mode.Paytm
				, UID	: ctxt.JournalID
				, Name  : 'Journal'
			}
			break
		case Model.event.CancellationByUser:
			rcd.Subject =
			{
				  Type 	: Model.mode.User
				, UID	: ctxt.User._id
				, Name  : ctxt.User.Name
			}
			break
		case Model.event.RejectionByStore:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Store._id
				, Name  : ctxt.Store.Name
			}
			break
		case Model.event.TimeoutByStore:
			rcd.Subject =
			{
				  Type 	: Model.mode.System
				, UID	: ''
				, Name  : Model.mode.System
			}
			break
		case Model.event.AcceptanceByStore:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Store._id
				, Name  : ctxt.Store.Name
			}
			break
		case Model.event.ProcessByStore:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Store._id
				, Name  : ctxt.Store.Name
			}
			break			
		case Model.event.DespatchmentByStore:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Store._id
				, Name  : ctxt.Store.Name
			}
			break
		case Model.event.IgnoranceByAgent:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Agent._id
				, Name  : ctxt.Agent.Name
			}
			break
		case Model.event.LockByAdmin:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Admin._id
				, Name  : ctxt.Admin.Name
			}
			break
		case Model.event.AssignmentByAdmin:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Admin._id
				, Name  : ctxt.Admin.Name
			}
			break
		case Model.event.TerminationByAdmin:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Admin._id
				, Name  : ctxt.Admin.Name
			}
			break
		case Model.event.ScheduleByAdmin:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Admin._id
				, Name  : ctxt.Admin.Name
			}
			break
		case Model.event.TimeoutByAgent:
			rcd.Subject =
			{
				  Type 	: Model.mode.System
				, UID	: ''
				, Name  : Model.mode.System
			}
			break
		case Model.event.RefeedByAdmin:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Admin._id
				, Name  : ctxt.Admin.Name
			}
			break
		case Model.event.AcceptanceByAgent:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Agent._id
				, Name  : ctxt.Agent.Name
			}
			break
		case Model.event.RejectionByAgent:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Agent._id
				, Name  : ctxt.Agent.Name
			}
			break
		case Model.event.CompletionByAgent:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Agent._id
				, Name  : ctxt.Agent.Name
			}
			break
		case Model.event.ResendOTP:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Agent._id
				, Name  : ctxt.Agent.Name
			}
			break
	}
	ctxt.History.push(rcd)
}

module.exports = { Set }