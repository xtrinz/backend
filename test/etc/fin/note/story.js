const event        = require('./event')
    , { TestCase } = require('../../../lib/driver')

const Std = function(text_, arbiter_, client_, seller_, note_)
{
        let tc = new TestCase(text_)
    const steps =
    [
          new event.Set    (arbiter_, note_)
        , new event.View   (client_,  note_)
        , new event.Cloudinary (seller_)
    ]
    steps.forEach((step) => tc.AddStep(step))             
    return tc
}

module.exports = 
{
    Std     : Std
}