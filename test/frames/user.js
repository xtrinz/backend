const { Method, Type }        = require("../lib/medium")
    , { task }                = require("../../pkg/common/models")
    , { code, status, text }  = require("../../pkg/common/error")
    , { entity }              = require("../../pkg/common/models")

const reg_new = 
{
      Type      : Type.Rest
    , Describe  : 'User Register New'
    , Path      : '/user/register'
    , Request   :
    {
          Method: Method.POST
        , Body  : 
        {
            Task     : task.New
          , MobileNo : '+918606135758'
          , Mode     : entity.User
        }
        , Header: {}
    }
    , Response  :
    {
          Code  : code.OK
        , Status: status.Success
        , Text  : text.OTPSendToMobNo.format('5758')
        , Data  : {}
    }
}

module.exports = [reg_new]