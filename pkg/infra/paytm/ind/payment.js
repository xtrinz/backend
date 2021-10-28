const checksum               = require("paytmchecksum")
    , { Err_, code, reason, channel
	,   paytm: pgw, states } = require('../../../system/models')
	, journal				 = require('../../../config/journal/archive')
	, { Cart } 				 = require('../../../config/cart/driver')
	, { ObjectID }			 = require('mongodb')
	, { PayTM } 			 = require('../driver')

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

		// TODO : Match Price IMPORTANT if prices are not matching some malpractic had happened
		// If not matching, initiate refund and add to stale fund events

		return rcd
	}

	this.Store 	  = async function(rcd)
	{

		rcd.Payment.TimeStamp.Webhook = this.Data.TXNDATE
		rcd.Payment.ChannelRefID 	  = this.Data.TXNID

		if(!rcd.Payment || (rcd.Payment && (rcd.Payment.Status == states.Success)))	// To avoid COD/Payment collitions
		{																			// or any other collitions
			// TODO Test it, it is Critical
			rcd.StaleFundEvents[fund.TransactionID] = 
			{
				Payment: 
				{
					  Channel       : channel.Paytm
					, TransactionID : pgw.Order.format(String(this.Data.JournalID))
					, Token         : ''
					, ChannelRefID  : this.Data.BankTxnId
					, Amount        : this.Data.Amount
					, Status        : (this.Data.Status == pgw.TxnSuccess)? states.Success: states.Failed
					, TimeStamp     : { Token: '', Webhook: (new Date()).toISOString() }
				}
			}
			await journal.Save(rcd)	// SAFE COMMIT

			if(this.Data.Status != pgw.TxnSuccess) return	// Event noted, No refund

			const refunt_     =
			{
				JournalID    : this.Data.JournalID
			  , ChannelRefID : this.Data.BankTxnId
			  , Amount       : this.Data.Amount
			}
			console.log('refund-on-state-indication', { Journal : refunt_ })			
			const paytm_      = new PayTM()
				, txn_i       = await paytm_.Refund(refunt_)
			rcd.StaleFundEvents[fund.TransactionID]['Refund'] =
			{
				Channel       : channel.Paytm
			  , TransactionID : txn_i.ID
			  , ChannelRefID  : txn_i.TxnID
			  , Amount        : txn_i.Amount
			  , Status        : txn_i.State
			  , TimeStamp     : 
			  {
				  Init	  : (new Date()).toISOString()
				, Webhook : ''
			  }
			}
			await journal.Save(rcd)
			console.log('refund-initiated', { Refund : rcd })
		}
		else
		{
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
		}
		return rcd.Transit.ID
	}
}

module.exports =
{
    Payment : Payment
}