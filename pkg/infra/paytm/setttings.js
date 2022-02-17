const paytm                          = require('paytm-pg-node-sdk')
    , { paytm: pgw }                 = require('../../sys/models')

    , Log                            = require('../../sys/log')

    , env                    = (process.env.PAYTM_ENV === pgw.DEFAULT)?
                                paytm.LibraryConstants.PRODUCTION_ENVIRONMENT :
                                paytm.LibraryConstants.STAGING_ENVIRONMENT
    , website                = (process.env.PAYTM_ENV !== pgw.DEFAULT)?
                                pgw.WEBSTAGING :
                                pgw.DEFAULT

Log('init-payment-gateway', { Env: env, WebSite: website})


paytm.Config.logName  = '[PAYTM]'
paytm.Config.logLevel = paytm.LoggingUtil.LogLevel.INFO
paytm.Config.logfile  = process.env.PWD + '/log/paytm.log'

paytm.MerchantProperties.setCallbackUrl(process.env.PAYTM_CB)
paytm.MerchantProperties.initialize(env, process.env.PAYTM_MID, process.env.PAYTM_KEY, website )