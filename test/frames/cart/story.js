const event        = require('./event')
    , { TestCase } = require('../../lib/driver')

    , Std = function(user_, product_, addr_, store_)
{
    let cart_   = user_
    let tc      = new TestCase('Cart Management')
    const steps =
    [
          new event.Insert (user_, cart_, product_)      
        , new event.List   (user_, cart_, addr_, store_)
        , new event.Update (user_, product_)
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