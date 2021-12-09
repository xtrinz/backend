const checksum = require("paytmchecksum")
    , Model    = require('../../system/models')	
	, journal  = require('../../config/journal/archive')
	, Log      = require('../../system/log')

function Refund(data, signature)
{
    if(data)
    this.Data =
    {
          JournalID    : data.orderId.slice( Model.paytm.Order.length - 3)
	    , TxnId 	   : data.txnId
        , RefundId     : data.refundId
        , TxnDate 	   : data.txnTimestamp
	    , Status 	   : data.status
	    , MId 		   : data.mid
	    , Amount 	   : data.refundAmount
	    , Checksum     : signature               // head.signature
    }
        
	this.CheckSign 	  = async function(body)
	{
        const sign = await checksum.verifySignature(body, process.env.PAYTM_KEY, this.Data.Checksum)
        if(!sign)
        {
            Log('refund-ind-unmatched-signature', { Body : body, Hash: this.Data.Checksum })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidChecksum)
        }
        Log('refund-ind-unmatched-signature', { Req : body })
	}

	this.Authorize 	  = async function()
	{

		if( process.env.PAYTM_MID !== this.Data.MId )
		{
			Log('refund-ind-with-wrong-mid', { Ind : this.Data })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidMid)
		}

		let rcd = await journal.GetByID(this.Data.JournalID)
		if( !rcd )
		{
			Log('journal-not-found', { Ind : this.Data })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.JournalNotFound)
		}

		// TODO : Match Price
	}

	this.Store 	  = async function(rcd)
	{
		rcd.Refund.TimeStamp.Webhook 	= Date.now()
		rcd.Refund.TxnId  				= this.Data.txnId
		switch (this.Data.Status)
		{
			case Model.paytm.RefundSuccess:
			rcd.Refund.Status = states.Success
			break

			case Model.paytm.RefundFailure:
			rcd.Refund.Status = states.Failed
			break
		}
		await journal.Save(rcd)
	}
}

module.exports = Refund