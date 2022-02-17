const event        = require('./event')
    , { TestCase } = require('../../../lib/driver')

    , Std = function(text_, client_, seller_, product_, addr_, cart_)
{
    let tc      = new TestCase(text_)
    const steps =
    [
          new event.Insert (client_, cart_, product_)      
        , new event.List   (client_, cart_, addr_, seller_)
        , new event.Update (client_, product_, true)
        , new event.Update (client_, product_, false)
        , new event.Remove (client_, product_)
        , new event.Insert (client_, cart_, product_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports = 
{
    Std     : Std
}