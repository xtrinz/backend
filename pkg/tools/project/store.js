const { verb, mode } = require('../../system/models')

module.exports =
{
    [verb.view]:
    {
          [mode.User]:
        {     _id         : 1
            , Name        : 1
            , Type        : 1
            , Image       : 1
            , Status      : 1
            , ClosingTime : 1
            , Description : 1 
        }
        , [mode.Admin]:
        {   
            _id           : 1
            , Name        : 1
            , Type        : 1
            , Text        : 1
            , Image       : 1
            , State       : 1
            , Status      : 1
            , ClosingTime : 1
            , Description : 1
        }
    }
}