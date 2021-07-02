const map = require('../common/map')

let EffortFeePerKM = 3      // in rs
  , PetrolFeePerKM = 2      // in rs
  , FeePerKg       = .01    // in rs
  , FeePerMCube    = 1      // in rs
let TypeVSMargin   =        // in %
{
      Food         : { Business : 10, Agent : 5, Net: 15 }
    , Electronics  : { Business : 15, Agent : 5, Net: 20 }
    , Cloth        : { Business : 20, Agent : 5, Net: 25 }
}
let CostPerKM      = EffortFeePerKM + PetrolFeePerKM

const SetBill      = async function(data, store_id)
{
    data.Products.forEach((prod) =>
    {
        data.Bill.Total += ( prod.Price * prod.Quantity )
    })
    let cord =
    {
          SrcLt  : 12
        , SrcLn  : 12
        , DestLt : data.Address.Lattitude
        , DestLn : data.Address.Longitude
    }
    let dist = await map.Distance(cord)
    data.Bill.TransitCost = dist * CostPerKM
}
module.exports = { SetBill : SetBill }