const { verb, mode } = require('../../sys/models')

module.exports =
{
    [verb.list]:
    {
        [mode.Arbiter]:
        { 
              _id      : 1
            , Name     : 1
            , Email    : 1
            , Text     : 1 
            , Status   : 1
            , State    : 1
            , MobileNo : 1 
        }
    }    
}