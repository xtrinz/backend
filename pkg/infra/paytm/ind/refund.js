const checksum               = require("paytmchecksum")
    , { Err_, code, reason } = require('../../../common/error')
	, { paytm: pgw }         = require('../../../common/models')
	, journal				 = require('../../../config/journal/archive')

function Refund(data, signature)
{
    if(data)
    this.Data =
    {
          JournalID    : data.orderId.slice( pgw.Order.length - 3)
	    , TxnId 	   : data.txnId
        , RefundId     : data.refundId
        , TxnDate 	   : data.txnTimestamp
	    , Status 	   : data.status
	    , MId 		   : data.mid
	    , Amount 	   : data.refundAmount
	    , Checksum     : signature               // head.signature
    }
        
	this.CheckSign 	  = function(body)
	{
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
	}

	this.Store 	  = function(rcd)
	{
		// Update DB with status
	}
}

module.exports =
{
    Refund : Refund
}