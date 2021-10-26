const event        = require('./event')
    , { TestCase } = require('../../lib/driver')

const Std = function(text_, note_, admin_, user_)
{
        let tc = new TestCase(text_)
    const steps =
    [
          new event.Set    (admin_, note_)
        , new event.View   (user_,  note_)
    ]
    steps.forEach((step) => tc.AddStep(step))             
    return tc
}

module.exports = 
{
    Std     : Std
}