const checksum      = require("paytmchecksum")
    , Model  		= require('../../system/models')
	, journal		= require('../../config/journal/archive')
	, { Cart } 		= require('../../config/cart/driver')
	, { ObjectId }	= require('mongodb')
	, paytm 		= require('./driver')

function Payment(data)
{
    if(data)
    this.Data =
    {
	      JournalID   : data.ORDERID.slice( Model.paytm.Order.length - 3)
	    , TxnId 	  : data.TXNID
	    , TxnDate 	  : data.TXNDATE
	    , Status 	  : data.STATUS
	    , BankTxnId   : data.BANKTXNID
	    , MId 		  : data.MID
	    , Amount 	  : data.TXNAMOUNT
	    , Checksum    : data.CHECKSUMHASH
    }
        
	this.CheckSign 	  = async function(body)
	{
        delete body.CHECKSUMHASH
        const sign = await checksum.verifySignature(body, process.env.PAYTM_KEY, this.Data.Checksum)
        if(!sign)
        {
            console.log('payment-ind-unmatched-signature', { Body : body, Hash: this.Data.Checksum })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidChecksum)
        }
        console.log('payment-ind-signature-matched', { Req : body })
	}

	this.Authorize 	  = async function()
	{

		if( process.env.PAYTM_MID !== this.Data.MId )
		{
			console.log('payment-ind-with-wrong-mid', { Ind : this.Data })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidMid)
		}

		let rcd = await journal.GetByID(this.Data.JournalID)
		if( !rcd )
		{
			console.log('journal-not-found', { Ind : this.Data })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.JournalNotFound)
		}

		// TODO : Match Price IMPORTANT if prices are not matching some malpractic had happened
		// If not matching, initiate refund and add to stale fund events

		return rcd
	}

	this.Store 	  = async function(rcd)
	{

		rcd.Payment.Time.Webhook = this.Data.TxnDate
		rcd.Payment.RefID 	  	 = this.Data.TxnId

		switch (this.Data.Status)
		{
			case Model.paytm.TxnSuccess:

				await (new Cart()).Flush(rcd.Buyer.ID)

				rcd.Payment.Status = Model.states.Success
				rcd.Transit.Status = Model.states.Initiated
				break

			case Model.paytm.TxnFailure:

				rcd.Payment.Status = Model.states.Failed		  
				break
		}

		await journal.Save(rcd)
	}
}

module.exports = Payment