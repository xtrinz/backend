const { verb, method, paytm } = require('../../../system/models')

module.exports =
{
    [verb.payment]             :
    {
      [method.post]            : 
      {
          'body'               : [ 'required', 'object' ]          
        , 'body.ORDERID'       : [ 'required', 'string', [ 'length', 30, 30 ] ]
        , 'body.TXNID'         : [ 'required', 'string' ]
        , 'body.TXNDATE'       : [ 'required', 'string' ]
        , 'body.STATUS'        : [ 'required', 'string', [ 'in', paytm.TxnSuccess, paytm.TxnFailure, paytm.TxnPending ] ]
        , 'body.BANKTXNID'     : [ 'required', 'string' ]
        , 'body.MID'           : [ 'required', 'string', [ 'in', process.env.PAYTM_MID ] ]
        , 'body.TXNAMOUNT'     : [ 'required', 'numeric', [ 'min', 1 ] ]
        , 'body.CHECKSUMHASH'  : [ 'required', 'string' ] // LEN
      }
    }
    , [verb.refund]           :
    {
      [method.post]           : 
      {
          'body'              : [ 'required', 'object' ]  
        , 'headers'           : [ 'required', 'object' ]
      }
    }
}