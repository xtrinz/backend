const checksum               = require("paytmchecksum")
    , { Err_, code, reason } = require('../../../system/error')
	, { paytm: pgw }         = require('../../../system/models')
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
        
	this.CheckSign 	  = async function(body)
	{
        const sign = await checksum.verifySignature(body, process.env.PAYTM_KEY, this.Data.Checksum)
        if(!sign)
        {
            console.log('refund-ind-unmatched-signature', { Body : body, Hash: this.Data.Checksum })
            Err_(code.BAD_REQUEST, reason.InvalidChecksum)
        }
        console.log('refund-ind-unmatched-signature', { Req : body })
	}

	this.Authorize 	  = async function()
	{

		if( process.env.PAYTM_MID !== this.Data.MId )
		{
			console.log('refund-ind-with-wrong-mid', { Ind : this.Data })
            Err_(code.BAD_REQUEST, reason.InvalidMid)
		}

		let rcd = await journal.GetByID(this.Data.JournalID)
		if( !rcd )
		{
			console.log('journal-not-found', { Ind : this.Data })
            Err_(code.BAD_REQUEST, reason.JournalNotFound)
		}

		// TODO : Match Price
	}

	this.Store 	  = async function(rcd)
	{
		/*
		rcd.Payment.TimeStamp = Date.now()
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

		await journal.Save(j_rcd)
		return rcd.Transit.ID
		*/
	}
}

module.exports =
{
    Refund : Refund
}