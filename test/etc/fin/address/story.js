const event        = require('./event')
    , { TestCase } = require('../../../lib/driver')

const Std = function(text_, client_, addr_)
{
        let tc = new TestCase(text_)
    const steps =
    [
          new event.Add    (client_, addr_)
        , new event.View   (client_, addr_)
        , new event.List   (client_, addr_)
        , new event.Update (client_, addr_)
        , new event.Remove (client_, addr_)
        , new event.Add    (client_, addr_)
    ]
    steps.forEach((step) => tc.AddStep(step))             
    return tc
}

module.exports = 
{
    Std     : Std
}