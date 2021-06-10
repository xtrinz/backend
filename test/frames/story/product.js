const event        = require('../event/product')
    , { TestCase } = require("../../lib/driver")

    , Std = function(staff_, store_, product_)
{
    let user_  = staff_
    let tc     = new TestCase('Product Management')
    let prod =
    [
          new event.Add    (staff_, store_, product_)
        , new event.View   (user_ , store_, product_)
        , new event.List   (user_ , store_, product_)
        , new event.Modify (staff_, store_, product_)
        , new event.Remove (staff_, store_, product_)
        , new event.Add    (staff_, store_, product_)        
    ]
    prod.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports = 
{
    Std     : Std
}