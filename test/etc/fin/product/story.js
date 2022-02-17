const event        = require('./event')
    , { TestCase } = require('../../../lib/driver')

    , Std = function(text_, client_, seller_, product_, journal)
{
    let tc     = new TestCase(text_)
    let prod =
    [

          new event.Add    (        seller_, product_)
        , new event.List   (client_ , seller_, product_)
        , new event.View   (client_ , seller_, product_)
        , new event.Modify (        seller_, product_)
        , new event.Remove (        seller_, product_)
        , new event.Add    (        seller_, product_)        
    ]
    prod.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports = 
{
    Std     : Std
}