

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
		case Model.event.Init:
			rcd.Subject =
			{
				  Type 	: Model.mode.Paytm
				, UID	: ctxt.JournalID
				, Name  : 'Journal'
			}
			break
		case Model.event.Cancel:
			rcd.Subject =
			{
				  Type 	: Model.mode.User
				, UID	: ctxt.User._id
				, Name  : ctxt.User.Name
			}
			break
		case Model.event.Reject:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Store._id
				, Name  : ctxt.Store.Name
			}
			break
		case Model.event.Accept:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Store._id
				, Name  : ctxt.Store.Name
			}
			break
		case Model.event.Ready:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Store._id
				, Name  : ctxt.Store.Name
			}
			break			
		case Model.event.Despatch:
			rcd.Subject =
			{
				  Type 	: Model.mode.Store
				, UID	: ctxt.Store._id
				, Name  : ctxt.Store.Name
			}
			break
		case Model.event.Ignore:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Agent._id
				, Name  : ctxt.Agent.Name
			}
			break
		case Model.event.Terminate:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Admin._id
				, Name  : ctxt.Admin.Name
			}
			break
		case Model.event.Assign:
			rcd.Subject =
			{
				  Type 	: Model.mode.Admin
				, UID	: ctxt.Admin._id
				, Name  : ctxt.Admin.Name
			}
			break
		case Model.event.Commit:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Agent._id
				, Name  : ctxt.Agent.Name
			}
			break
		case Model.event.Quit:
			rcd.Subject =
			{
				  Type 	: Model.mode.Agent
				, UID	: ctxt.Agent._id
				, Name  : ctxt.Agent.Name
			}
			break
		case Model.event.Done:
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