const event         = require('../event/user')
    , { TestCase }  = require("../../lib/driver")

const Std = function(user_)
{
    let tc    = new TestCase('User Management')
    let step1 = new event.RegisterNew(user_)          ; tc.AddStep(step1)
    let step2 = new event.RegisterReadOTP(user_)      ; tc.AddStep(step2)
    let step3 = new event.Register(user_)             ; tc.AddStep(step3)
    let step4 = new event.Login(user_)                ; tc.AddStep(step4)
    let step5 = new event.PasswordGenOTP(user_)       ; tc.AddStep(step5)
    let step6 = new event.PasswordConfirmMobNo(user_) ; tc.AddStep(step6)
    let step7 = new event.PasswordSet(user_)          ; tc.AddStep(step7)
    let step8 = new event.ProfileGet(user_)           ; tc.AddStep(step8)
    let step9 = new event.ProfileEdit(user_)          ; tc.AddStep(step9)
    return tc
}

const AddUser = function(tc, user_)
{
    let step1 = new event.RegisterNew(user_)          ; tc.AddStep(step1)
    let step2 = new event.RegisterReadOTP(user_)      ; tc.AddStep(step2)
    let step3 = new event.Register(user_)             ; tc.AddStep(step3)
    return tc
}

module.exports = {
      Std     : Std
    , AddUser : AddUser
}