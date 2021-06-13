const event        = require('../event/journal')
    , { TestCase } = require("../../lib/driver")

const Std = function(user_, addr_, owner_, staff_)
{
    let cart_  = user_
    let tc     = new TestCase('Journal Management')
    let steps  =
    [
          new event.Create         (user_, addr_, cart_)
        , new event.ConfirmPayment ()
        , new event.NewOrder       (owner_)
        , new event.NewOrder       (staff_)
        , new event.NewOrder       (user_)          
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports = 
{
    Std     : Std
}