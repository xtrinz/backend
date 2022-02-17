const map    = require('../../../sys/map')
    , Log    = require('../../../sys/log')
    , coin   = require('./coin')

const Bill      = async function(order_, cords_)
{

    let bill = 
    {
        Product  : 0
      , Transit  : 0
      , Tax      : 0
      , Total    : 0
    }
    for(let i = 0; i < order_.Products.length; i++)
    {
        let item      = order_.Products[i]
        bill.Product += item.Quantity * item.Price
    }
    let km        = await map.Distance(cords_)
    bill.Transit  = km * coin.Transit.Total

    bill.Tax      = .18 * bill.Transit
    bill.Product  = bill.Product.round()
    bill.Transit  = bill.Transit.round()
    bill.Tax      = bill.Tax.round()

    bill.Total    = bill.Product
                  + bill.Transit
                  + bill.Tax

    bill.Total    = bill.Total.round()

    Log('bill-genereted', { Bill: bill, Order: order_ , Cords: cords_ })

    return bill
}

module.exports = Bill