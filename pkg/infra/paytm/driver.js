const paytm = require('paytm-pg-node-sdk')
    , Model = require('../../sys/models')
    , Log   = require('../../sys/log')
class PayTM
{
    static async CreateToken(j_id, price, client_)
    {

      const txn_i1 =
      {
          ID      : Model.paytm.Order.format(String(j_id))
        , Token   : "txnToken"
        , Amount  : price.toString()
        , MID     : process.env.PAYTM_MID
        , CB      : process.env.PAYTM_CB
      }

      return txn_i1
      /** TODO blocked for testing */
        /**
         * Input : JournalID | NetPrice | Client.Address/Email/Name/MobileNo
         */
        Log('paytm-create-token', { JournalID : j_id, Price: price, Client: client_ })

        const channelId = paytm.EChannelId.WEB
            , orderId   = Model.paytm.Order.format(String(j_id))
            , amnt      = price.toString()

            , txnAmount = paytm.Money.constructWithCurrencyAndValue(paytm.EnumCurrency.INR, amnt)

            , client      = new paytm.ClientInfo(String(client_.ID))
              client.setAddress   (JSON.stringify(client_.Address))
              client.setEmail     (client_.Email)
              client.setFirstName (client_.Name)
              client.setMobile    (client_.MobileNo)
              client.setPincode   (client_.Address.PostalCode) //.toString())

        let payment = new paytm.PaymentDetailBuilder(channelId, orderId, txnAmount, client)
          , req     = payment.build()
          , resp    = {}
        
        try { resp = await paytm.Payment.createTxnToken(req) }
        catch (err)
        {
            Log('paytm-sdk-exepction-token-creation-failed', { Error : err, JournalID : j_id, Price: price, Client: client_ })
            Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.TokenCreationFailed)
        }

        let res     = resp.getResponseObject()
          , body    = res.getBody()
          , info    = body.getResultInfo()
          , sts     = info.getResultStatus()
  
        if(sts !== Model.paytm.Success)
        {
            Log('paytm-token-creation-failed', { Response : resp.responseObject.body, Request: req })
            Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.TokenCreationFailed)
        }
        const txnToken = body.getTxnToken()
        Log('paytm-token-created', { JournalID : j_id, Price: price, Client: client_, Resp : body })

        const txn_i =
        {
            ID     : orderId
          , Token  : txnToken
          , Amount : amnt
          , MID    : process.env.PAYTM_MID
          , CB     : process.env.PAYTM_CB
        }

        return txn_i
    }

    static async PaymentStatus(data)
    {
        Log('paytm-check-payment-status', { Input : data })

        let orderId                     = Model.paytm.Order.format(String(data.JournalID))
          , paymentStatusDetailBuilder  = new paytm.PaymentStatusDetailBuilder(orderId)
          , paymentStatusDetail         = paymentStatusDetailBuilder.setReadTimeout(Model.paytm.ReadTimeout).build()
          , resp = {}

        try { resp = await paytm.Payment.getPaymentStatus(paymentStatusDetail) }
        catch (err)
        {
            Log('paytm-sdk-exepction-pyment-status-retrieval-failed', { Error : err, Input: data})
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
        Log('paytm-payment-status', { Input : data, Resp : ret })

        return ret        
    }

    static async Refund(data)
    {
        Log('paytm-refund', { Input : data })

        const orderId      = Model.paytm.Order.format(String(data.JournalID))
            , refId        = Model.paytm.Refund.format(String(data.JournalID))
            , txnId        = data.RefID
            , txnType      = Model.paytm.Type.REFUND
            , refundAmount = data.Amount.toString()

        let refund       = new paytm.RefundDetailBuilder(orderId, refId, txnId, txnType, refundAmount)
          , refundDetail = refund.setReadTimeout(Model.paytm.ReadTimeout).build()
          , resp         = {}
       
        try { resp = await paytm.Refund.initiateRefund(refundDetail) }
        catch (err)
        {
            Log('paytm-sdk-exepction-refund-failed', { Error : err, Input: data })
            Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.TokenCreationFailed)
        }

        let res     = resp.getResponseObject()
          , body    = res.getBody()
          , info    = body.getResultInfo()
          , sts     = info.getResultStatus()
  
        if(sts !== Model.paytm.RefundPending)
        {
            Log('paytm-token-creation-failed', { Response : resp, Body: body, Info: info, Sts: sts })
            Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.RefundFailed)
        }

        const txn_i =
        {
            ID     : refId
          , RefID  : body.getRefundId()
          , Amount : refundAmount 
          , State  : Model.paytm.RefundPending
        }

        Log('paytm-refund-initiated', { Input : data, Response : resp, TxnInfo: txn_i })
        return txn_i
    }

    static async RefundStatus(data)
    {
        Log('paytm-check-refund-status', { Input : data })

        const orderId                   = Model.paytm.Order.format(String(data.JournalID))
            , refId                     = Model.paytm.Refund.format(String(data.JournalID))
            , refundStatusDetailBuilder = new paytm.RefundStatusDetailBuilder(orderId, refId)
            , refundStatusDetail        = refundStatusDetailBuilder.setReadTimeout(Model.paytm.ReadTimeout).build()
            , resp                      = {}

        try { resp = await paytm.Refund.getRefundStatus(refundStatusDetail) }
        catch (err)
        {
            Log('paytm-sdk-exepction-refund-status-retrieval-failed', { Error : err, Input: data})
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
        Log('paytm-refund-status', { Input : data, Resp : ret })

        return ret
    }

}

module.exports = PayTM