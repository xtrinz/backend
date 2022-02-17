const event         = require('./event')
    , { TestCase }  = require('../../../lib/driver')

const Std = function(text_, arbiter_, journal_)
{
    let tc       = new TestCase(text_)
    const steps_ =
    [
          new event.RegisterNew     (arbiter_          )
        , new event.RegisterReadOTP (arbiter_, journal_)
        , new event.Register        (arbiter_          )
        , new event.Connect         (arbiter_          )
        , new event.ProfileEdit     (arbiter_          )
        , new event.ProfileGet      (arbiter_          )
        , new event.Dsc             (arbiter_          )
        , new event.Connect         (arbiter_          )
    ]
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

const Dsc = function()
{
    let tc     = new TestCase('Dsc Socket Clients')
    let steps_ = []

    let args = Array.prototype.slice.call(arguments)
    args.forEach((arbiter)=> { steps_.push(new event.Dsc (arbiter)) })
    
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

module.exports = { Std, Dsc }