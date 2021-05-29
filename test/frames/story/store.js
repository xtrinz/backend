const event        = require('../event/store')
    , { TestCase } = require("../../lib/driver")
    , user         = require('../data/user')
    , { AddUser }  = require('./user')

const Std = function(store_)
{
    let tc     = new TestCase('Store Management')
    let step01 = new event.RegisterNew(store_)        ; tc.AddStep(step01)
    let step02 = new event.RegisterReadOTP(store_)    ; tc.AddStep(step02)
    let step03 = new event.RegisterApprove(store_)    ; tc.AddStep(step03)
    let step04 = new event.Read(store_)               ; tc.AddStep(step04)
    let step05 = new event.List(store_)               ; tc.AddStep(step05)
        tc     = AddUser(tc, user.Staff)

    let step06 = new event.AddStaffRequest(user.Staff); tc.AddStep(step06)
    let step08 = new event.AddStaffRevoke(user.Staff) ; tc.AddStep(step08)

    let step09 = new event.AddStaffRequest(user.Staff); tc.AddStep(step09)
    let step10 = new event.AddStaffAccept(user.Staff) ; tc.AddStep(step10)
    let step11 = new event.AddStaffRelieve(user.Staff); tc.AddStep(step11)

    let step12 = new event.AddStaffRequest(user.Staff); tc.AddStep(step12)
    let step13 = new event.AddStaffAccept(user.Staff) ; tc.AddStep(step13)
    let step14 = new event.ListStaff(user.Staff)      ; tc.AddStep(step14)

    return tc
}

module.exports = 
{
    Std     : Std
}