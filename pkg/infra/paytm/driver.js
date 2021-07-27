require('../../cmd/settings')

const paytm                          = require('paytm-pg-node-sdk')
    , { paytm: pgw }                 = require('../../common/models')
    , { Err_, code, reason, status } = require('../../common/error')

    , env                    = (process.env.PAYTM_ENV === pgw.DEFAULT)?
                                paytm.LibraryConstants.PRODUCTION_ENVIRONMENT :
                                paytm.LibraryConstants.STAGING_ENVIRONMENT
    , website                = (process.env.PAYTM_ENV === pgw.DEFAULT)?
                                pgw.WEBSTAGING :
                                pgw.DEFAULT

paytm.MerchantProperties.setCallbackUrl(process.env.PAYTM_CB_URL)
paytm.MerchantProperties.initialize(env, process.env.PAYTM_MID, process.env.PAYTM_KEY, website )

// paytm.Config.logName  = '[PAYTM]'
// paytm.Config.logLevel = paytm.LoggingUtil.LogLevel.INFO
// paytm.Config.logfile  = '/path/log/file.log'

function PayTM()
{
    this.CreateToken = async function(data)
    {
        /**
         * Input : JournalID | NetPrice | User.Address/Email/Name/MobileNo
         */
        console.log('paytm-create-token', { Input : data })

        const channelId = paytm.EChannelId.WEB
            , orderId   = pgw.Order.format(String(data.JournalID))
            , amnt      = data.NetPrice.toString()

            , txnAmount = paytm.Money.constructWithCurrencyAndValue(paytm.EnumCurrency.INR, amnt)

            , user      = new paytm.UserInfo(String(data.User.ID))
              user.setAddress   (JSON.stringify(data.User.Address))
              user.setEmail     (data.User.Email)
              user.setFirstName (data.User.Name)
              user.setMobile    (data.User.MobileNo)
              user.setPincode   (data.User.Address.PostalCode.toString())

        let payment = new paytm.PaymentDetailBuilder(channelId, orderId, txnAmount, user)
          , req     = payment.build()
          , resp    = {}
        
        try { resp = await paytm.Payment.createTxnToken(req) }
        catch (err)
        {
            console.log('paytm-sdk-exepction-token-creation-failed', { Error : err, Input: data })
            Err_(code.INTERNAL_SERVER, reason.TokenCreationFailed)
        }

        let res     = resp.getResponseObject()
          , body    = res.getBody()
          , info    = body.getResultInfo()
          , sts     = info.getResultStatus()
  
        if(sts !== pgw.Success)
        {
            console.log('paytm-token-creation-failed', { Response : resp })
            Err_(code.INTERNAL_SERVER, reason.TokenCreationFailed)
        }
        const txnToken = body.getTxnToken()
        console.log('paytm-token-created', { Input : data, Resp : body })

        return txnToken
    }

    this.PaymentStatus = function(data)
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

    this.Refund     = function(data)
    {
        console.log('paytm-refund', { Input : data })

        const orderId      = pgw.Order.format(String(data.JournalID))
            , refId        = pgw.Refund.format(String(data.JournalID))
            , txnId        = data.TxnId
            , txnType      = pgw.Type.REFUND
            , refundAmount = data.Amount.toString()

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
            console.log('paytm-token-creation-failed', { Response : resp })
            Err_(code.INTERNAL_SERVER, reason.RefundFailed)
        }

        const paytmRefundId = body.getRefundId()

        console.log('paytm-refund-initiated', { Input : data, Response : resp })
        return paytmRefundId
    }

    this.RefundStatus = function(data)
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