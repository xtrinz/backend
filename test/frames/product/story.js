const event        = require('./event')
    , { TestCase } = require('../../lib/driver')

    , Std = function(text_, user_, store_, product_, journal)
{
    let tc     = new TestCase(text_)
    let prod =
    [

          new event.Add    (        store_, product_)
        , new event.List   (user_ , store_, product_)
        , new event.View   (user_ , store_, product_)
        , new event.Modify (        store_, product_)
        , new event.Remove (        store_, product_)
        , new event.Add    (        store_, product_)        
    ]
    prod.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports = 
{
    Std     : Std
}