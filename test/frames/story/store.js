const event        = require('../event/store')
    , { TestCase } = require("../../lib/driver")

const Std = function(store_)
{
    let tc    = new TestCase('Store Management')
    let step1 = new event.RegisterNew(store_)     ; tc.AddStep(step1)
    let step2 = new event.RegisterReadOTP(store_) ; tc.AddStep(step2)
    let step3 = new event.RegisterApprove(store_) ; tc.AddStep(step3)
    let step4 = new event.Read(store_)            ; tc.AddStep(step4)    
    return tc
}

module.exports = 
{
    Std     : Std
}