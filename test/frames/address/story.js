const event        = require('./event')
    , { TestCase } = require('../../lib/driver')

const Std = function(text_, user_, addr_)
{
        let tc = new TestCase(text_)
    const steps =
    [
          new event.Add    (user_, addr_)
        , new event.View   (user_, addr_)
        , new event.List   (user_, addr_)
        , new event.Update (user_, addr_)
        , new event.Remove (user_, addr_)
        , new event.Add    (user_, addr_)
    ]
    steps.forEach((step) => tc.AddStep(step))             
    return tc
}

module.exports = 
{
    Std     : Std
}