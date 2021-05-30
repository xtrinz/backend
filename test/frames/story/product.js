const event                                = require('../event/product')
    , { TestCase }                         = require("../../lib/driver")
    , { AddUser }                          = require('./user')
    , { AddStaffRequest, AddStaffAccept }  = require('../event/store')
    , user                                 = require('../data/user')

const Std = function(product_)
{
    let tc     = new TestCase('Product Management')
        tc     = AddUser(tc, user.Staff2)
    let step01 = new AddStaffRequest(user.Staff2); tc.AddStep(step01)
    let step02 = new AddStaffAccept(user.Staff2) ; tc.AddStep(step02)
    let step03 = new event.Add(product_)         ; tc.AddStep(step03)
    let step04 = new event.Modify(product_)      ; tc.AddStep(step04)
    let step05 = new event.Remove(product_)      ; tc.AddStep(step05)

    let step06 = new event.Add(product_)         ; tc.AddStep(step06)    
    let step07 = new event.View(product_)        ; tc.AddStep(step07)    
    let step08 = new event.List(product_)        ; tc.AddStep(step08)    

    return tc
}

module.exports = 
{
    Std     : Std
}