const { verb, mode } = require('../../system/models')

module.exports =
{
    [verb.view]:
    {
        [mode.Admin]:
        { 
              _id      : 1
            , Name     : 1
            , Email    : 1
            , Text     : 1
            , Location : 1 
            , Status   : 1
            , State    : 1
            , MobileNo : 1 
        }
    }
}