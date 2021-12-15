const { Method, Type }  = require('../../lib/medium')
    , { code, status }  = require('../../../pkg/system/models')

let View = function(mode_, id_, token, data_)
{
      let templ   =
      {
          Type             : Type.Rest
        , Describe         : 'Journal View ' + mode_
        , Request          :
        {
              Method       : Method.GET
            , Path         : '/v1/journal/view'
            , Body         : {}
            , Query        : 
            {
                JournalID  : id_
              , IsLive     : false
            }
            , Header       : { Authorization: token }
        }
        , Skip             : [ 'TimeStamp', 'Date' ]
        , Response         :
        {
            Code           : code.OK
          , Status         : status.Success
          , Text           : ''
          , Data           : data_
        }
      }
    return templ
}

let List = function(mode_, token, data_)
{
    let templ   =
    {
          Type             : Type.Rest
        , Describe         : 'Journal List ' + mode_
        , Request          :
        {
              Method       : Method.GET
            , Path         : '/v1/journal/list'
            , Body         : {}
            , Query        : 
            {
                  Page     : 1
                , Limit    : 8
                , IsLive   : false              
            }
            , Header       : { Authorization: token }
        }
        , Skip             : [ 'TimeStamp', 'Date' ]
        , Response         :
        {
            Code           : code.OK
            , Status       : status.Success
            , Text         : ''
            , Data         : data_
        }
    }
    return templ
}

module.exports = { View, List }