const map         = require('../system/map')
    , { states }  = require('../system/models')
    , Log         = require('./log')

/**
 * Context of price per for unit subjects
 * TYPE     : UNIT
 * ---------------
 * Distance : KM 
 */
const Price    = 
{
    Product    : {} // TODO - PLAN PRODUCT MARGIN
  , Transit    : 
    {
        Fuel   : 2 
      , Effort : 3
      , Total  : 5
    }
}

const Bill      = async function(order_, cords_)
{

    let bill = 
    {
        Product : 0
      , Transit : 0
      , Tax     : 0
      , Total   : 0
    }
    for(let i = 0; i < order_.Products.length; i++)
    {
        let item      = order_.Products[i]
        bill.Product += item.Quantity * item.Price
    }

    let km       = await map.Distance(cords_)
    bill.Transit = km * Price.Transit.Total

    bill.Tax     = .18 * bill.Transit

    bill.Product = bill.Product.round()
    bill.Transit = bill.Transit.round()
    bill.Tax     = bill.Tax.round()

    bill.Total   =  bill.Product
                  + bill.Transit
                  + bill.Tax

    Log('bill-genereted', { Bill: bill, Order: order_ , Cords: cords_ })

    return bill
}

const Settle = async function(data, state)
{
  data.Account =
  {
      In :
    {
        Dynamic : { Payment : { Buyer : data.Bill.Total }  }
      , Static  : { Penalty : { Buyer : 0, Store : 0, Agent : 0, Business : 0 } }
    }
    , Out :
    {
        Dynamic : { Refund  : { Buyer : 0 } }
      , Static  : { Payout  : { Store : 0, Agent : 0, Business: 0, Govt: 0 } }
    }
  }
  switch (state.Current)
  {
    case states.Completed : // Alpha-Done

      data.Account.Out.Static.Payout  =
      { 
          Store    : data.Bill.Product
        , Agent    : .75 * data.Bill.Transit
        , Business : .25 * data.Bill.Transit
        , Govt     : data.Bill.Tax
      }

    break

    // Fix the rest
    case states.CargoCancelled   :

      switch(state.Previous)
      {
        case states.CargoInitiated:
          data.Account.In.Static.Penalty.Buyer
          data.Account.Out.Dynamic.Refund.Buyer
          data.Account.Out.Static.Payout  =
          { 
              Store    : data.Bill.Total
            , Agent    : .75 * data.Bill.Transit
            , Business : .25 * data.Bill.Transit
            , Govt     : data.Bill.Tax
          }
    
          break
        case states.OrderAccepted:
          data.Account.In.Static.Penalty.Buyer  = 0 // Set penalty
          data.Account.Out.Dynamic.Refund.Buyer = 
                  data.Bill.Transit
                + data.Bill.Tax
                + data.Bill.Total // - penalty
          data.Account.Out.Static.Payout        =
          {
              Store    : 0       // Analyse effort of store
            , Agent    : 0
            , Business : 000 * 0 // Distribute penalty
            , Govt     : .18 * 0
          }
          break
        case states.TransitAccepted:
          data.Account.In.Static.Penalty.Buyer  = 0 // Set penalty
          data.Account.Out.Dynamic.Refund.Buyer = 
                  data.Bill.Transit
                + data.Bill.Tax
                + data.Bill.Total // - penalty
          data.Account.Out.Static.Payout        =
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

      data.Account.In.Static.Penalty.Store  = 0 // Set penalty

      data.Account.Out.Dynamic.Refund.Buyer =
              data.Bill.Transit
            + data.Bill.Tax
            + data.Bill.Total // + penalty / coupen

      data.Account.Out.Static.Payout        =
      {
          Store    : 0
        , Agent    : 0
        , Business : 000 * 0 // Distribute penalty
        , Govt     : .18 * 0
      }

    break
    case states.TransitTerminated:
      switch(state.Previous)
      {
        case states.TransitAbandoned:
          // Deliver eeteduthavan pattillann paranju & next filering failed

          data.Account.In.Static.Penalty =
                { 
                      Buyer    : 0
                    , Store    : 0
                    , Agent    : 0 * 00 // Set Penalty
                    , Business : 0
                } 

          data.Account.Out.Dynamic.Refund.Buyer = 
                  data.Bill.Transit
                + data.Bill.Tax
                + data.Bill.Total // + add compensation

          data.Account.Out.Static.Payout        =
          {
              Store    : 000 * 0 //
            , Agent    : 0
            , Business : 000 * 0 // Distribute penalty among '//'es
            , Govt     : .18 * 0 //
          }

          break
        case states.OrderOnHold: 
        // Aarum live alla delivery cheyyan, filtering itself failed

        data.Account.In.Static.Penalty =
              { 
                    Buyer    : 0
                  , Store    : 0
                  , Agent    : 0
                  , Business : 0 // Set Penalty
              } 
        data.Account.Out.Dynamic.Refund.Buyer = 
                data.Order.Bill.TransitCost
              + data.Order.Bill.Tax
              + data.Order.Bill.Total // + coupen/ compensation

        data.Account.Out.Static.Payout        =
            {
                Store    : 000
              , Agent    : 0
              , Business : 0
              , Govt     : 0 // See is there any tax on coupen or compensation
            }

          break
        case states.TransitOnHold: // Pillar live nd, but aarum interested alla

        data.Account.In.Static.Penalty =
              { 
                    Buyer    : 0
                  , Store    : 0
                  , Agent    : 0
                  , Business : 000 // Set Penatly
              } 

        data.Account.Out.Dynamic.Refund.Buyer = 
                data.Order.Bill.TransitCost
              + data.Order.Bill.Tax
              + data.Order.Bill.Total // + coupen or compensation

        data.Account.Out.Static.Payout        =
        {
            Store    : 000      //
          , Agent    : 0
          , Business : 0
          , Govt     : 000      // Distribute penalty
        }
        break
      }
    break
  }
}

module.exports = { Bill, Settle }