//-- The packge acts as an enabler for unit test --//
const router                 = require("express").Router()
    , test                   = process.env.ENABLETEST
    , { code, status, text } = require("../common/error")

    var Exports =
{
      OTP: ''
    , UserID: ''
}

const IsEnabled = ()  => 
{
    if(test)
        return true
    else
        return false
}

const Set = (key, val)  => 
{
    if(test)
    Exports[key] = val
}

const Get = (key)  => 
{
    if(test)
    return Exports[key]
}

router.get("/", async (req, res, next) => {
    let code_, status_, text_, data_
    if (test === '1')
    {
        code_   = code.OK
        status_ = status.Success,
        text_   = ''
        data_   = Exports
    } else {
        code_   = code.INTERNAL_SERVER
        status_ = status.Failed,
        text_   = text.TestNotEnabled
        data_   = {}
    }
    return res.status(code_).json({
        Status  : status_,
        Text    : text_,
        Data    : data_
    })
})
module.exports = 
{
      test      : router
    , Set       : Set
    , Get       : Get
    , IsEnabled : IsEnabled
}