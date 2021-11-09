const paytm = require('paytm-pg-node-sdk')
    , Model = require('../../system/models')

class PayTM
{
    static async CreateToken(j_id, price, user_)
    {

      const txn_i1 =
      {
          ID           : Model.paytm.Order.format(String(j_id))
        , Token        : "txnToken"
        , Amount       : price.toFixed(2).toString()
        , MID          : process.env.PAYTM_MID
        , CallBackURL  : process.env.PAYTM_CB
      }

      return txn_i1
      /** TODO blocked for testing */
        /**
         * Input : JournalID | NetPrice | User.Address/Email/Name/MobileNo
         */
        console.log('paytm-create-token', { JournalID : j_id, Price: price, User: user_ })

        const channelId = paytm.EChannelId.WEB
            , orderId   = Model.paytm.Order.format(String(j_id))
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
            Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.TokenCreationFailed)
        }

        let res     = resp.getResponseObject()
          , body    = res.getBody()
          , info    = body.getResultInfo()
          , sts     = info.getResultStatus()
  
        if(sts !== Model.paytm.Success)
        {
            console.log('paytm-token-creation-failed', { Response : resp.responseObject.body, Request: req })
            Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.TokenCreationFailed)
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

    static async PaymentStatus(data)
    {
        console.log('paytm-check-payment-status', { Input : data })

        let orderId                     = Model.paytm.Order.format(String(data.JournalID))
          , paymentStatusDetailBuilder  = new paytm.PaymentStatusDetailBuilder(orderId)
          , paymentStatusDetail         = paymentStatusDetailBuilder.setReadTimeout(Model.paytm.ReadTimeout).build()
          , resp = {}

        try { resp = await paytm.Payment.getPaymentStatus(paymentStatusDetail) }
        catch (err)
        {
            console.log('paytm-sdk-exepction-pyment-status-retrieval-failed', { Error : err, Input: data})
            Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.StatusRetrievalFailed)
        }

        let res   = resp.getResponseObject()
          , body  = res.getBody()
          , info  = body.getResultInfo()
          , sts   = info.getResultStatus()
        const ret =
        {
            TxnId   : body.getTxnId()
          , JournalID : body.getOrderId().slice( Model.paytm.Order.length - 3)
          , Status  : (sts === Model.paytm.TxnSuccess)?  Model.status.Success : Model.status.Failed
        }
        console.log('paytm-payment-status', { Input : data, Resp : ret })

        return ret        
    }

    static async Refund(data)
    {
        console.log('paytm-refund', { Input : data })

        const orderId      = Model.paytm.Order.format(String(data.JournalID))
            , refId        = Model.paytm.Refund.format(String(data.JournalID))
            , txnId        = data.ChannelRefID
            , txnType      = Model.paytm.Type.REFUND
            , refundAmount = data.Amount.toFixed(2).toString()

        let refund       = new paytm.RefundDetailBuilder(orderId, refId, txnId, txnType, refundAmount)
          , refundDetail = refund.setReadTimeout(Model.paytm.ReadTimeout).build()
          , resp         = {}
       
        try { resp = await paytm.Refund.initiateRefund(refundDetail) }
        catch (err)
        {
            console.log('paytm-sdk-exepction-refund-failed', { Error : err, Input: data })
            Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.TokenCreationFailed)
        }

        let res     = resp.getResponseObject()
          , body    = res.getBody()
          , info    = body.getResultInfo()
          , sts     = info.getResultStatus()
  
        if(sts !== Model.paytm.RefundPending)
        {
            console.log('paytm-token-creation-failed', { Response : resp, Body: body, Info: info, Sts: sts })
            Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.RefundFailed)
        }

        const txn_i =
        {
            ID     : refId
          , TxnID  : body.getRefundId()
          , Amount : refundAmount 
          , State  : Model.paytm.RefundPending
        }

        console.log('paytm-refund-initiated', { Input : data, Response : resp, TxnInfo: txn_i })
        return txn_i
    }

    static async RefundStatus(data)
    {
        console.log('paytm-check-refund-status', { Input : data })

        const orderId                   = Model.paytm.Order.format(String(data.JournalID))
            , refId                     = Model.paytm.Refund.format(String(data.JournalID))
            , refundStatusDetailBuilder = new paytm.RefundStatusDetailBuilder(orderId, refId)
            , refundStatusDetail        = refundStatusDetailBuilder.setReadTimeout(Model.paytm.ReadTimeout).build()
            , resp                      = {}

        try { resp = await paytm.Refund.getRefundStatus(refundStatusDetail) }
        catch (err)
        {
            console.log('paytm-sdk-exepction-refund-status-retrieval-failed', { Error : err, Input: data})
            Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.RefundStatusRetrievalFailed)
        }
        let res   = resp.getResponseObject()
          , body  = res.getBody()
          , info  = body.getResultInfo()
          , sts   = info.getResultStatus()

        const res_sts = (sts === Model.paytm.RefundPending)? Model.status.Pending : 
                        (sts === Model.paytm.RefundFailure)? Model.status.Failed  : Model.status.Success
        const ret =
        {
            JournalID : body.getOrderId().slice( Model.paytm.Order.length - 3)
          , Status    : res_sts
        }
        console.log('paytm-refund-status', { Input : data, Resp : ret })

        return ret
    }

}

module.exports = PayTM