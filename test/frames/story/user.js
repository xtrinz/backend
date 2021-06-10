const event         = require('../event/user')
    , { TestCase }  = require("../../lib/driver")

const Std = function(user_)
{
    let tc    = new TestCase('User Management')
    const steps_ =
    [
          new event.RegisterNew         (user_)
        , new event.RegisterReadOTP     (user_)
        , new event.Register            (user_)
        , new event.Login               (user_)
        , new event.PasswordGenOTP      (user_)
        , new event.PasswordConfirmMobNo(user_)
        , new event.PasswordSet         (user_)
        , new event.ProfileGet          (user_)
        , new event.ProfileEdit         (user_)
    ]
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}


const AddUser = function(tc, user_)
{
    const steps_ =
    [
        new event.RegisterNew         (user_)
      , new event.RegisterReadOTP     (user_)
      , new event.Register            (user_)
    ]
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}


module.exports =
{
      Std     : Std
    , AddUser : AddUser
}