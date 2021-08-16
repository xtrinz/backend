const map = require('../common/map')

// Volumetric Charges
let FeePerKg       = .01    // in rs
  , FeePerMCube    = 1      // in rs

// Prodcut Profit Share
let TypeVSMargin   =        // in %
{
      Food         : { Business : 10, Agent : 5, Net: 15 }
    , Electronics  : { Business : 15, Agent : 5, Net: 20 }
    , Cloth        : { Business : 20, Agent : 5, Net: 25 }
}

// Transit Effort Charges
let EffortFeePerKM = 3      // in rs
  , PetrolFeePerKM = 2      // in rs
  , CostPerKM      = EffortFeePerKM + PetrolFeePerKM

const SetBill      = async function(data, src_loc, dest_loc)
{

    data.Bill = 
    { 
        Total       : 0
      , TransitCost : 0
      , Tax         : 0
      , NetPrice    : 0
    }

    // Product Price
    data.Products.forEach((prod) => 
    { data.Bill.Total += ( prod.Price * prod.Quantity ) })

    // Transit Charge
    let cord =
    {
          SrcLt  : src_loc.Lattitude
        , SrcLn  : src_loc.Longitude
        , DestLt : dest_loc.Lattitude
        , DestLn : dest_loc.Longitude
    }
    let dist = await map.Distance(cord)
    data.Bill.TransitCost = dist * CostPerKM

    // Charge Tax
    data.Bill.Tax = .18 * data.Bill.TransitCost
                  // + 0

    // Net Price
    data.Bill.NetPrice = data.Bill.TransitCost
                       + data.Bill.Total
                       + data.Bill.Tax
}

const SetAccount = async function(data)
{
  
  data.Account =
  {
        In :
      {
          Dynamic : { Payment : { Buyer : 0 } }
        , Static  : { Penalty : { Buyer : 0, Store : 0, Agent : 0 } }
      }
      , Out :
      {
          Dynamic : { Refund  : { Buyer : 0 } }
        , Static  : { Payout  : { Store : 0, Agent : 0 } }
      }
  }

//  // Product Price
//  data.Products.forEach((prod) => 
//  { data.Bill.Total += ( prod.Price * prod.Quantity ) })
//
//  // Charge Tax
//  data.Bill.Tax = .18 * data.Bill.TransitCost
//                // + 0
//
//  // Net Price
//  data.Bill.NetPrice = data.Bill.TransitCost
//                     + data.Bill.Total
//                     + data.Bill.Tax
}

module.exports = 
{ 
       SetBill : SetBill
  , SetAccount : SetAccount
}