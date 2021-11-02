const event         = require('./event')
    , { TestCase }  = require('../../lib/driver')

const Std = function(desc_, user_)
{
    let tc    = new TestCase(desc_)
    const steps_ =
    [
          new event.RegisterNew         (user_)
        , new event.RegisterReadOTP     (user_)
        , new event.Register            (user_)
        , new event.Connect             (user_)
        , new event.ProfileGet          (user_)
        , new event.ProfileEdit         (user_)
        , new event.Disconnect          (user_)
        , new event.Connect             (user_)
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
      , new event.ProfileEdit         (user_)      
      , new event.Connect             (user_)
    ]
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

const Disconnect = function()
{
    let tc     = new TestCase('Disconnect Socket Clients')
    let steps_ = []

    let args = Array.prototype.slice.call(arguments)
    args.forEach((user)=> { steps_.push(new event.Disconnect (user)) })
    
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

module.exports =
{
      Std        : Std
    , AddUser    : AddUser
    , Disconnect : Disconnect
}