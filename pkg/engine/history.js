

const  Model	    = require('../system/models')

const Set = async function(ctxt)
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
		case Model.event.InitiationByUser:
			rcd.Subject =
			{
				  Type 	: Model.mode.Paytm
				, UID	: ctxt.Data.JournalID
				, Name  : 'Journal'
			}
			break
		case Model.event.CancellationByUser:
			rcd.Subject =
			{
				  Type 	: Model.mode.User
				, UID	: ctxt.Data.User._id
				, Name  : ctxt.Data.User.Name
			}
			break
		case Model.event.RejectionByStore:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Data.Store._id
				, Name  : ctxt.Data.Store.Name
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
				, UID	: ctxt.Data.Store._id
				, Name  : ctxt.Data.Store.Name
			}
			break
		case Model.event.ProcessByStore:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Data.Store._id
				, Name  : ctxt.Data.Store.Name
			}
			break			
		case Model.event.DespatchmentByStore:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Data.Store._id
				, Name  : ctxt.Data.Store.Name
			}
			break
		case Model.event.IgnoranceByAgent:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Data.Agent._id
				, Name  : ctxt.Data.Agent.Name
			}
			break
		case Model.event.LockByAdmin:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Data.Admin._id
				, Name  : ctxt.Data.Admin.Name
			}
			break
		case Model.event.AssignmentByAdmin:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Data.Admin._id
				, Name  : ctxt.Data.Admin.Name
			}
			break
		case Model.event.TerminationByAdmin:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Data.Admin._id
				, Name  : ctxt.Data.Admin.Name
			}
			break
		case Model.event.ScheduleByAdmin:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Data.Admin._id
				, Name  : ctxt.Data.Admin.Name
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
				, UID	: ctxt.Data.Admin._id
				, Name  : ctxt.Data.Admin.Name
			}
			break
		case Model.event.AcceptanceByAgent:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Data.Agent._id
				, Name  : ctxt.Data.Agent.Name
			}
			break
		case Model.event.RejectionByAgent:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Data.Agent._id
				, Name  : ctxt.Data.Agent.Name
			}
			break
		case Model.event.CompletionByAgent:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Data.Agent._id
				, Name  : ctxt.Data.Agent.Name
			}
			break
		case Model.event.ResendOTP:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Data.Agent._id
				, Name  : ctxt.Data.Agent.Name
			}
			break
	}
	ctxt.Data.History.push(rcd)
}

module.exports = { Set }