const checksum               = require("paytmchecksum")
    , { Err_, code, reason } = require('../../../common/error')
	, { paytm: pgw }         = require('../../../common/models')
	, journal				 = require('../../../config/journal/archive')

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
        
	this.CheckSign 	  = function(body)
	{
        delete body.CHECKSUMHASH
        const sign = checksum.verifySignature(body, process.env.PAYTM_KEY, this.Data.Checksum)
        if(!sign)
        {
            console.log('payment-ind-unmatched-signature', { Body : body, Hash: this.Data.Checksum })
            Err_(code.BAD_REQUEST, reason.InvalidChecksum)
        }
        console.log('payment-ind-unmatched-signature', { Req : body })
	}

	this.Authorize 	  = function()
	{

		if( process.env.PAYTM_MID !== this.Data.MId )
		{
			console.log('payment-ind-with-wrong-mid', { Ind : this.Data })
            Err_(code.BAD_REQUEST, reason.InvalidMid)
		}

		let rcd = journal.GetByID(this.Data.JournalID)
		if( !rcd )
		{
			console.log('journal-not-found', { Ind : this.Data })
            Err_(code.BAD_REQUEST, reason.JournalNotFound)
		}

		// TODO : Match Price
		return rcd
	}

	this.Store 	  = function(rcd)
	{
		rcd.Payment.TimeStamp = Date.now()
		switch (this.Data.Status)
		{
		case pgw.TxnSuccess:

		  await (new Cart()).Flush(rcd.Buyer.ID)

		  rcd.Payment.Status = states.Success
		  rcd.Transit.Status = states.Initiated
		  break

		case pgw.TxnFailure:

		  rcd.Payment.Status = states.Failed		  
		  break
		}  
	}
}

module.exports =
{
    Payment : Payment
}