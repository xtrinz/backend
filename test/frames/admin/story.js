const event         = require('./event')
    , { TestCase }  = require('../../lib/driver')

const Std = function(text_, admin_)
{
    let tc       = new TestCase(text_)
    const steps_ =
    [
          new event.RegisterNew     (admin_)
        , new event.RegisterReadOTP (admin_)
        , new event.Register        (admin_)
        , new event.Connect         (admin_)
        , new event.ProfileEdit     (admin_)
        , new event.ProfileGet      (admin_)
        , new event.Disconnect      (admin_)
        , new event.Connect         (admin_)
    ]
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

const Disconnect = function()
{
    let tc     = new TestCase('Disconnect Socket Clients')
    let steps_ = []

    let args = Array.prototype.slice.call(arguments)
    args.forEach((admin)=> { steps_.push(new event.Disconnect (admin)) })
    
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

module.exports =
{
      Std        : Std
    , Disconnect : Disconnect
}