const paytm                = require('paytm-pg-node-sdk')
    , {   paytm: pgw
        , Err_, code
        , reason, status } = require('../../system/models')

function PayTM()
{
    this.CreateToken = async function(j_id, price, user_)
    {
        /**
         * Input : JournalID | NetPrice | User.Address/Email/Name/MobileNo
         */
        console.log('paytm-create-token', { JournalID : j_id, Price: price, User: user_ })

        const channelId = paytm.EChannelId.WEB
            , orderId   = pgw.Order.format(String(j_id))
            , amnt      = price.toFixed(2).toString()

            , txnAmount = paytm.Money.constructWithCurrencyAndValue(paytm.EnumCurrency.INR, amnt)

            , user      = new paytm.UserInfo(String(user_.ID))
              user.setAddress   (JSON.stringify(user_.Address))
              user.setEmail     (user_.Email)
              user.setFirstName (user_.Name)
              user.setMobile    (user_.MobileNo)
              user.setPincode   (user_.Address.PostalCode) //.toString())

        let payment = new paytm.PaymentDetailBuilder(channelId, orderId, txnAmount, user)
          , req     = payment.build()
          , resp    = {}
        
        try { resp = await paytm.Payment.createTxnToken(req) }
        catch (err)
        {
            console.log('paytm-sdk-exepction-token-creation-failed', { Error : err, JournalID : j_id, Price: price, User: user_ })
            Err_(code.INTERNAL_SERVER, reason.TokenCreationFailed)
        }

        let res     = resp.getResponseObject()
          , body    = res.getBody()
          , info    = body.getResultInfo()
          , sts     = info.getResultStatus()
  
        if(sts !== pgw.Success)
        {
            console.log('paytm-token-creation-failed', { Response : resp.responseObject.body, Request: req })
            Err_(code.INTERNAL_SERVER, reason.TokenCreationFailed)
        }
        const txnToken = body.getTxnToken()
        console.log('paytm-token-created', { JournalID : j_id, Price: price, User: user_, Resp : body })

        const txn_i =
        {
            ID           : orderId
          , Token        : txnToken
          , Amount       : amnt
          , MID          : process.env.PAYTM_MID
          , CallBackURL  : process.env.PAYTM_CB
        }

        return txn_i
    }

    this.PaymentStatus = async function(data)
    {
        console.log('paytm-check-payment-status', { Input : data })

        let orderId                     = pgw.Order.format(String(data.JournalID))
          , paymentStatusDetailBuilder  = new paytm.PaymentStatusDetailBuilder(orderId)
          , paymentStatusDetail         = paymentStatusDetailBuilder.setReadTimeout(pgw.ReadTimeout).build()
          , resp = {}

        try { resp = await paytm.Payment.getPaymentStatus(paymentStatusDetail) }
        catch (err)
        {
            console.log('paytm-sdk-exepction-pyment-status-retrieval-failed', { Error : err, Input: data})
            Err_(code.INTERNAL_SERVER, reason.StatusRetrievalFailed)
        }

        let res   = resp.getResponseObject()
          , body  = res.getBody()
          , info  = body.getResultInfo()
          , sts   = info.getResultStatus()
        const ret =
        {
            TxnId   : body.getTxnId()
          , JournalID : body.getOrderId().slice( pgw.Order.length - 3)
          , Status  : (sts === pgw.TxnSuccess)?  status.Success : status.Failed
        }
        console.log('paytm-payment-status', { Input : data, Resp : ret })

        return ret        
    }

    this.Refund     = async function(data)
    {
        console.log('paytm-refund', { Input : data })

        const orderId      = pgw.Order.format(String(data.JournalID))
            , refId        = pgw.Refund.format(String(data.JournalID))
            , txnId        = data.ChannelRefID
            , txnType      = pgw.Type.REFUND
            , refundAmount = data.Amount.toFixed(2).toString()

        let refund       = new paytm.RefundDetailBuilder(orderId, refId, txnId, txnType, refundAmount)
          , refundDetail = refund.setReadTimeout(pgw.ReadTimeout).build()
          , resp         = {}
       
        try { resp = await paytm.Refund.initiateRefund(refundDetail) }
        catch (err)
        {
            console.log('paytm-sdk-exepction-refund-failed', { Error : err, Input: data })
            Err_(code.INTERNAL_SERVER, reason.TokenCreationFailed)
        }

        let res     = resp.getResponseObject()
          , body    = res.getBody()
          , info    = body.getResultInfo()
          , sts     = info.getResultStatus()
  
        if(sts !== pgw.RefundPending)
        {
            console.log('paytm-token-creation-failed', { Response : resp, Body: body, Info: info, Sts: sts })
            Err_(code.INTERNAL_SERVER, reason.RefundFailed)
        }

        const txn_i =
        {
            ID     : refId
          , TxnID  : body.getRefundId()
          , Amount : refundAmount 
          , State  : pgw.RefundPending
        }

        console.log('paytm-refund-initiated', { Input : data, Response : resp, TxnInfo: txn_i })
        return txn_i
    }

    this.RefundStatus = async function(data)
    {
        console.log('paytm-check-refund-status', { Input : data })

        const orderId                   = pgw.Order.format(String(data.JournalID))
            , refId                     = pgw.Refund.format(String(data.JournalID))
            , refundStatusDetailBuilder = new paytm.RefundStatusDetailBuilder(orderId, refId)
            , refundStatusDetail        = refundStatusDetailBuilder.setReadTimeout(pgw.ReadTimeout).build()
            , resp                      = {}

        try { resp = await paytm.Refund.getRefundStatus(refundStatusDetail) }
        catch (err)
        {
            console.log('paytm-sdk-exepction-refund-status-retrieval-failed', { Error : err, Input: data})
            Err_(code.INTERNAL_SERVER, reason.RefundStatusRetrievalFailed)
        }
        let res   = resp.getResponseObject()
          , body  = res.getBody()
          , info  = body.getResultInfo()
          , sts   = info.getResultStatus()

        const res_sts = (sts === pgw.RefundPending)? status.Pending : 
                        (sts === pgw.RefundFailure)? status.Failed  : status.Success
        const ret =
        {
            JournalID : body.getOrderId().slice( pgw.Order.length - 3)
          , Status    : res_sts
        }
        console.log('paytm-refund-status', { Input : data, Resp : ret })

        return ret
    }

}

module.exports.PayTM = PayTM