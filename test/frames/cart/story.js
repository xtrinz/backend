const event        = require('./event')
    , { TestCase } = require('../../lib/driver')

    , Std = function(text_, user_, store_, product_, addr_, cart_)
{
    let tc      = new TestCase(text_)
    const steps =
    [
          new event.Insert (user_, cart_, product_)      
        , new event.List   (user_, cart_, addr_, store_)
        , new event.Update (user_, product_, true)
        , new event.Update (user_, product_, false)
        , new event.Remove (user_, product_)
        , new event.Insert (user_, cart_, product_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports = 
{
    Std     : Std
}