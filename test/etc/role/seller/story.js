const event        = require('./event')
    , { TestCase } = require('../../../lib/driver')

const Std = function(text_, arbiter_, client_, seller_, journal)
{
    let tc = new TestCase(text_)
    const seller = 
    [
          new event.RegisterNew     (seller_           )            // Seller
        , new event.RegisterReadOTP (seller_, journal  )
        , new event.Register        (seller_           )
        , new event.RegisterApprove (arbiter_, seller_ )
        , new event.Edit            (seller_           )
        , new event.Read            (client_, seller_  )
        , new event.List            (client_, seller_  )
        , new event.Connect         (seller_           )        
    ]
    seller.forEach((step)=> tc.AddStep(step))
    return tc
}

const Dsc = function()
{
    let tc     = new TestCase('Dsc Seller Socket Clients')
    let steps_ = []

    let args = Array.prototype.slice.call(arguments)
    args.forEach((seller)=> { steps_.push(new event.Dsc (seller)) })
    
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

module.exports = { Std, Dsc }