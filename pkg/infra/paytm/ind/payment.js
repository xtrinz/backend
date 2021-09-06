const checksum               = require("paytmchecksum")
    , { Err_, code, reason } = require('../../../system/error')
	, { paytm: pgw, states } = require('../../../system/models')
	, journal				 = require('../../../config/journal/archive')
	, { Cart } 				 = require('../../../config/cart/driver')
	, { ObjectID }			 = require('mongodb')

function Payment(data)
{
    if(data)
    this.Data =
    {
	      JournalID   : data.ORDERID.slice( pgw.Order.length - 3)
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
            Err_(code.BAD_REQUEST, reason.InvalidChecksum)
        }
        console.log('payment-ind-signature-matched', { Req : body })
	}

	this.Authorize 	  = async function()
	{

		if( process.env.PAYTM_MID !== this.Data.MId )
		{
			console.log('payment-ind-with-wrong-mid', { Ind : this.Data })
            Err_(code.BAD_REQUEST, reason.InvalidMid)
		}

		let rcd = await journal.GetByID(this.Data.JournalID)
		if( !rcd )
		{
			console.log('journal-not-found', { Ind : this.Data })
            Err_(code.BAD_REQUEST, reason.JournalNotFound)
		}

		// TODO : Match Price
		return rcd
	}

	this.Store 	  = async function(rcd)
	{

		rcd.Payment.TimeStamp 	 = this.Data.TXNDATE
		rcd.Payment.ChannelRefID = this.Data.TXNID

		switch (this.Data.Status)
		{
		case pgw.TxnSuccess:

		  await (new Cart()).Flush(rcd.Buyer.ID)

		  rcd.Payment.Status = states.Success
		  rcd.Transit.Status = states.Initiated
		  rcd.Transit.ID 	 = new ObjectID()
		  break

		case pgw.TxnFailure:

		  rcd.Payment.Status = states.Failed		  
		  break
		}

		await journal.Save(rcd)
		return rcd.Transit.ID
	}
}

module.exports =
{
    Payment : Payment
}