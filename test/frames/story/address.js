const event                                = require('../event/address')
    , { TestCase }                         = require("../../lib/driver")

const Std = function(addr_)
{
    let tc     = new TestCase('Address Management')
    let step01 = new event.Add(addr_)         ; tc.AddStep(step01)
    let step02 = new event.View(addr_)        ; tc.AddStep(step02)
    let step03 = new event.List(addr_)        ; tc.AddStep(step03)
    addr_.Tag  = 'OFFICE'
    let step04 = new event.Update(addr_)      ; tc.AddStep(step04)
    addr_.Tag  = 'HOME'
    let step05 = new event.Update(addr_)      ; tc.AddStep(step05)
    let step06 = new event.Remove(addr_)      ; tc.AddStep(step06)

    let step07 = new event.Add(addr_)         ; tc.AddStep(step07)                
    return tc
}

module.exports = 
{
    Std     : Std
}