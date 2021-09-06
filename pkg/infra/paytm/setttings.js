const paytm                          = require('paytm-pg-node-sdk')
    , { paytm: pgw }                 = require('../../common/models')

    , env                    = (process.env.PAYTM_ENV === pgw.DEFAULT)?
                                paytm.LibraryConstants.PRODUCTION_ENVIRONMENT :
                                paytm.LibraryConstants.STAGING_ENVIRONMENT
    , website                = (process.env.PAYTM_ENV !== pgw.DEFAULT)?
                                pgw.WEBSTAGING :
                                pgw.DEFAULT

console.log('init-payment-gateway', { Env: env, WebSite: website})

paytm.MerchantProperties.setCallbackUrl(process.env.PAYTM_CB)
paytm.MerchantProperties.initialize(env, process.env.PAYTM_MID, process.env.PAYTM_KEY, website )

// paytm.Config.logName  = '[PAYTM]'
// paytm.Config.logLevel = paytm.LoggingUtil.LogLevel.INFO
// paytm.Config.logfile  = '/path/log/file.log'