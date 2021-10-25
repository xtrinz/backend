const event         = require('./event')
    , { TestCase }  = require('../../lib/driver')

const Std = function(text_, agent_, admin_)
{
    let tc    = new TestCase(text_)
    const steps_ =
    [
          new event.RegisterNew         (agent_)
        , new event.RegisterReadOTP     (agent_)
        , new event.Register            (agent_)
        , new event.RegisterApprove     (agent_, admin_)
        , new event.Connect             (agent_)
        , new event.ProfileEdit         (agent_)
        , new event.ProfileGet          (agent_)
        , new event.List                (agent_, admin_)
        , new event.Disconnect          (agent_)
        , new event.Connect             (agent_)
    ]
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}


const AddAgent = function(tc, agent_)
{
    const steps_ =
    [
        new event.RegisterNew         (agent_)
      , new event.RegisterReadOTP     (agent_)
      , new event.Register            (agent_)
      , new event.ProfileEdit         (agent_)      
      , new event.Connect             (agent_)
    ]
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

const Disconnect = function()
{
    let tc     = new TestCase('Disconnect Socket Clients')
    let steps_ = []

    let args = Array.prototype.slice.call(arguments)
    args.forEach((agent)=> { steps_.push(new event.Disconnect (agent)) })
    
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

module.exports =
{
      Std        : Std
    , AddAgent   : AddAgent
    , Disconnect : Disconnect
}