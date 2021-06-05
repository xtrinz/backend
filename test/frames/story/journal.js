const event        = require('../event/journal')
    , { TestCase } = require("../../lib/driver")

const Std = function(journal)
{
    let tc     = new TestCase('Journal Management')
    let step01 = new event.Create(journal)          ; tc.AddStep(step01)
    let step02 = new event.ConfirmPayment(journal)  ; tc.AddStep(step02)
    return tc
}

module.exports = 
{
    Std     : Std
}