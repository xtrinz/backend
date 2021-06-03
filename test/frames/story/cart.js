const event                                = require('../event/cart')
    , { TestCase }                         = require("../../lib/driver")

const Std = function(cart)
{
    let tc     = new TestCase('Cart Management')
    let step01 = new event.Insert(cart)         ; tc.AddStep(step01)
    let step02 = new event.Update(cart)         ; tc.AddStep(step02)
    let step03 = new event.Remove(cart)         ; tc.AddStep(step03)

    let step04 = new event.Insert(cart)         ; tc.AddStep(step04)
    let step05 = new event.List  (cart)         ; tc.AddStep(step05)
    return tc
}

module.exports = 
{
    Std     : Std
}