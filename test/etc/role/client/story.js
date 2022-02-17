const event         = require('./event')
    , { TestCase }  = require('../../../lib/driver')

const Std = function(desc_, client_, journal_)
{
    let tc    = new TestCase(desc_)
    const steps_ =
    [
          new event.RegisterNew         (client_          )
        , new event.RegisterReadOTP     (client_, journal_)
        , new event.Register            (client_          )
        , new event.Connect             (client_          )
        , new event.ProfileGet          (client_          )
        , new event.ProfileEdit         (client_          )
        , new event.Dsc                 (client_          )
        , new event.Connect             (client_          )
    ]
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}


const AddClient = function(tc, client_)
{
    const steps_ =
    [
        new event.RegisterNew         (client_)
      , new event.RegisterReadOTP     (client_)
      , new event.Register            (client_)
      , new event.ProfileEdit         (client_)      
      , new event.Connect             (client_)
    ]
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

const Dsc = function()
{
    let tc     = new TestCase('Dsc Socket Clients')
    let steps_ = []

    let args = Array.prototype.slice.call(arguments)
    args.forEach((client)=> { steps_.push(new event.Dsc (client)) })
    
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

module.exports =
{
      Std        : Std
    , AddClient    : AddClient
    , Dsc : Dsc
}