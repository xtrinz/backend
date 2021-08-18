const map         = require('../common/map')
    , { states }  = require('../common/models')

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

const SettleAccounts = async function(data, state)
{
  data.Account =
  {
      In :
    {
        Dynamic : 
        { 
          Payment : 
          { 
            Buyer : data.Order.Bill.TransitCost + data.Order.Bill.Total + data.Order.Bill.Tax 
          } 
        }
      , Static  : { Penalty : { Buyer : 0, Store : 0, Agent : 0 } }
    }
    , Out :
    {
        Dynamic : { Refund  : { Buyer : 0 } }
      , Static  : { Payout  : { Store : 0, Agent : 0, Business: 0, Govt: 0 } }
    }
  }
  switch (state.Current)
  {
    case states.TranistCompleted : // Alpha-Done

      this.Account.Out.Static.Payout  =
      { 
          Store    : data.Order.Bill.Total
        , Agent    : .75 * data.Order.Bill.TransitCost
        , Business : .25 * data.Order.Bill.TransitCost
        , Govt     : data.Order.Bill.Tax
      }

    break
    case states.CargoCancelled   :

      switch(state.Previous)
      {
        case states.CargoInitiated:
          this.Account.In.Static.Penalty.Buyer
          this.Account.Out.Dynamic.Refund.Buyer
          this.Account.Out.Static.Payout  =
          { 
              Store    : data.Order.Bill.Total
            , Agent    : .75 * data.Order.Bill.TransitCost
            , Business : .25 * data.Order.Bill.TransitCost
            , Govt     : data.Order.Bill.Tax
          }
    
          break
        case states.OrderAccepted:
          this.Account.In.Static.Penalty.Buyer  = 0 // Set penalty
          this.Account.Out.Dynamic.Refund.Buyer = 
                  data.Order.Bill.TransitCost
                + data.Order.Bill.Tax
                + data.Order.Bill.Total // - penalty
          this.Account.Out.Static.Payout        =
          {
              Store    : 0       // Analyse effort of store
            , Agent    : 0
            , Business : 000 * 0 // Distribute penalty
            , Govt     : .18 * 0
          }
          break
        case states.TransitAccepted:
          this.Account.In.Static.Penalty.Buyer  = 0 // Set penalty
          this.Account.Out.Dynamic.Refund.Buyer = 
                  data.Order.Bill.TransitCost
                + data.Order.Bill.Tax
                + data.Order.Bill.Total // - penalty
          this.Account.Out.Static.Payout        =
          {
              Store    : 0       // Analyse effort of store
            , Agent    : 000 * 0
            , Business : 000 * 0 // Distribute penalty
            , Govt     : .18 * 0
          }
          break
      }

    break
    case states.OrderRejected    :

      this.Account.In.Static.Penalty.Store  = 0 // Set penalty

      this.Account.Out.Dynamic.Refund.Buyer =
              data.Order.Bill.TransitCost
            + data.Order.Bill.Tax
            + data.Order.Bill.Total // + penalty / coupen

      this.Account.Out.Static.Payout        =
      {
          Store    : 0
        , Agent    : 0
        , Business : 000 * 0 // Distribute penalty
        , Govt     : .18 * 0
      }

    break
    case states.TransitRejected  :
      switch(state.Previous)
      {
        case states.TransitAccepted:

          this.Account.In.Static.Penalty.Buyer
          this.Account.In.Static.Penalty.Store
          this.Account.In.Static.Penalty.Agent
    
          this.Account.Out.Dynamic.Refund.Buyer
    
          this.Account.Out.Static.Payout  =
          { 
              Store    : data.Order.Bill.Total
            , Agent    : .75 * data.Order.Bill.TransitCost
            , Business : .25 * data.Order.Bill.TransitCost
            , Govt     : data.Order.Bill.Tax
          }
          break
        case states.OrderAccepted:
          break
        case states.CargoInitiated:
          break
      }
    break

    case states.TransitTerminated:
      switch(state.Previous)
      {
        case states.TransitAccepted:
          break
        case states.OrderAccepted:
          break
        case states.CargoInitiated:
          break
      }
    break
  }
}

module.exports = 
{ 
           SetBill : SetBill
  , SettleAccounts : SettleAccounts
}