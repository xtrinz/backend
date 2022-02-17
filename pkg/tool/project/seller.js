const { verb, mode } = require('../../sys/models')

module.exports =
{
    [verb.view]:
    {
          [mode.Client]:
        {     _id         : 1
            , Name        : 1
            , Type        : 1
            , Image       : 1
            , Status      : 1
            , ClosingTime : 1
            , Description : 1 
        }
        , [mode.Arbiter]:
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
    },
    [verb.list]:
    {
          [mode.Client]:
        {     _id         : 1
            , Name        : 1
            , Type        : 1
            , Image       : 1
            , Status      : 1
            , ClosingTime : 1
            , Description : 1 
        }
        , [mode.Arbiter]:
        {   
              _id         : 1
            , Name        : 1
            , MobileNo    : 1
            , Email       : 1
            , Text        : 1
            , State       : 1
            , Status      : 1
            , ClosingTime : 1 
        }
    }    
}