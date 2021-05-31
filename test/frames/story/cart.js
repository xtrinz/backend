const event                                = require('../event/cart')
    , { TestCase }                         = require("../../lib/driver")

const Std = function(entry, product)
{
    let tc     = new TestCase('Cart Management')
    let step01 = new event.Insert(entry)         ; tc.AddStep(step01)
    let step02 = new event.Update(entry)         ; tc.AddStep(step02)
    let step03 = new event.Remove(entry)         ; tc.AddStep(step03)

    let step04 = new event.Insert(entry)         ; tc.AddStep(step04)
    let step05 = new event.List(entry, product)  ; tc.AddStep(step05)
    return tc
}

module.exports = 
{
    Std     : Std
}