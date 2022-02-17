const Model = require('../../../sys/models')
    , Log   = require('../../../sys/log')
	, Grid 	= require('./grid')
	, db 	= require('../../exports')[Model.segment.db]

class Entry 
{
  constructor(acc, mode, id, name, amnt)
  {
    this.Account = acc
    this.Nature  = mode
    this.ID      = id
    this.Owner   = name
    this.Amount  = amnt
  }
}

const Record = function(book, event_, note_, desc_)
{
	let rcd =
	{
		  Time		    : Date(Date.now()).toString()
		, Event 	    : event_
		, Note	      	: note_
		, Description 	: desc_
	}
	book.push(rcd)
}

const Enter = async function(j_id, event_)
{
	let ctxt = await db.journal.GetByID(j_id)
    if (!ctxt)
    {
        Log('journal-not-found', { JournalID : j_id })
        Model.Err_(Model.code.NOT_FOUND, Model.reason.NoJournal)
    }

	let grid = Grid(ctxt.Order, ctxt.Bill)

	let book = []

	let ct1, ct2, ct3, ct4, dt1, dt2, dt3, dt4
	switch (event_)
	{
		case Model.event.Init:

			dt1 = new Entry(Model.account.PGW,    Model.entry.Debit, 	Model.account.PGW,   Model.account.PGW, grid.Main.Total.val)
			ct1 = new Entry(Model.account.Client, Model.entry.Credit, 	ctxt.Client.ID, 	 ctxt.Client.Name,  grid.Main.Total.val)

			Record(book, event_, [dt1, ct1], Model.desc.Paid)

			dt2 = new Entry(Model.account.PSP,    Model.entry.Debit, 	Model.account.PSP,   Model.account.PSP, grid.Main.PSP_Init.val)
			ct2 = new Entry(Model.account.PGW, 	  Model.entry.Credit,	Model.account.PGW,   Model.account.PGW, grid.Main.PSP_Init.val)

			Record(book, event_, [dt2, ct2], Model.desc.Paid)

			break

		case Model.event.Cancel: break
		case Model.event.Reject: break

		case Model.event.Accept:
			// correct as per new diagram, settle client acc as well

			dt1 = new Entry(Model.account.PGW,    Model.entry.Debit,  	Model.account.PGW,   Model.account.PGW, grid.Main.GW.Total.val)
			ct1 = new Entry(Model.account.Seller, Model.entry.Credit, 	ctxt.Client.ID, 	 ctxt.Client.Name,  grid.Main.GW.Total.val)

			Record(book, event_, [dt1, ct1], Model.desc.Accepted)

			break

		case Model.event.Despatch:

			dt1 = new Entry(Model.account.Seller, 	Model.entry.Debit,	ctxt.Seller.ID, 	 	ctxt.Seller.Name, 	   grid.Main.GW.Seller.Transit.Total.val)
			ct1 = new Entry(Model.account.Transit, 	Model.entry.Credit, Model.account.Transit,  Model.account.Transit, grid.Main.GW.Seller.Transit.Total.val)

			Record(book, event_, [dt1, ct1], Model.desc.Despatched)

			dt2 = new Entry(Model.account.Seller,   Model.entry.Debit,	ctxt.Seller.ID, 		 ctxt.Seller.Name, 	     grid.Main.GW.Seller.Platform.Total.val)
			ct2 = new Entry(Model.account.Platform, Model.entry.Credit, Model.account.Platform,  Model.account.Platform, grid.Main.GW.Seller.Platform.Total.val)

			Record(book, event_, [dt2, ct2], Model.desc.Despatched)

			break
		case Model.event.Ignore:	break
		case Model.event.Terminate:	break
		case Model.event.Assign:	break
		case Model.event.Commit:	break
		case Model.event.Quit:		break
		case Model.event.Done:

			dt1 = new Entry(Model.account.Transit, 	Model.entry.Debit,  Model.account.Transit, 	Model.account.Transit, 	grid.Main.GW.Seller.Transit.Agent.Total.val)
			ct1 = new Entry(Model.account.Agent, 	Model.entry.Credit,	ctxt.Agent.ID,  		ctxt.Agent.Name, 		grid.Main.GW.Seller.Transit.Agent.Total.val)

			Record(book, event_, [dt1, ct1], Model.desc.Done)

			dt2 = new Entry(Model.account.Transit, 	Model.entry.Debit,  Model.account.Transit, 	Model.account.Transit, 	grid.Main.GW.Seller.Transit.System.Total.val)
			ct2 = new Entry(Model.account.System, 	Model.entry.Credit,	Model.account.System, 	Model.account.System, 	grid.Main.GW.Seller.Transit.System.Total.val)		

			Record(book, event_, [dt1, ct2], Model.desc.Done)

			dt3 = new Entry(Model.account.Platform, Model.entry.Debit,   Model.account.Platform,   Model.account.Platform, grid.Main.GW.Seller.Platform.Agent.Total.val)
			ct3 = new Entry(Model.account.Agent,  	Model.entry.Credit,  ctxt.Agent.ID,  		   ctxt.Agent.Name, 	   grid.Main.GW.Seller.Platform.Agent.Total.val)
			
			Record(book, event_, [dt3, ct3], Model.desc.Done)

			dt4 = new Entry(Model.account.Platform, Model.entry.Debit,  Model.account.Platform,  Model.account.Platform, grid.Main.GW.Seller.Platform.System.Total.val)			
			ct4 = new Entry(Model.account.System, 	Model.entry.Credit, Model.account.System,    Model.account.System, 	 grid.Main.GW.Seller.Platform.System.Total.val)		

			Record(book, event_, [dt4, ct4], Model.desc.Done)

			break
	}
	Log('entry-recorded', { Entires: book, Journal: ctxt })

	return book
}

module.exports = Enter