const Model  = require('../../../sys/models')
    , Log    = require('../../../sys/log')
    , coin   = require('./coin')
    , Price  = require('./model')

const Grid = function(order_, bill_)
{

  Log('create-pricing-context', JSON.stringify({ Order: order_, Bill: bill_ }))

  let   T               = new Price(0)
      , TP              = new Price(0)
      , TG              = new Price(0)
        , TGS           = new Price(0)           
          , TGST        = new Price(0)
            , TGSTA     = new Price(0)
              , TGSTAA  = new Price(0)
              , TGSTAO  = new Price(0)
            , TGSTS     = new Price(0)
              , TGSTSS  = new Price(0)
              , TGSTSO  = new Price(0)          
          , TGSP        = new Price(0)
            , TGSPA     = new Price(0)
              , TGSPAA  = new Price(0)
              , TGSPAO  = new Price(0)
            , TGSPS     = new Price(0)
              , TGSPSS  = new Price(0)
              , TGSPSO  = new Price(0)                      
          , TGSP_       = new Price(0)
            , TGSP_S    = new Price(0)
            , TGSP_P    = new Price(0)

  let NA    = new Price(0)
      , NAN = new Price(0)
      , NAP = new Price(0)
    , NS    = new Price(0)
      , NSN = new Price(0)
      , NSP = new Price(0)

	let ctxt =
  {
    Main:
    {
        PSP_Init             : TP
      , GW                   :
        {                     
          Seller             : 
          {                   
              Transit        : 
              {               
                  Agent      : {  Agent_Transit  : TGSTAA,  PSP_Agent_Transit_Out  : TGSTAO, Total: TGSTA }
                , System     : { System_Transit  : TGSTSS, PSP_System_Transit_Out  : TGSTSO, Total: TGSTS }
                , Total      : TGST
              }               
            , Platform       : 
              {               
                  Agent      : {  Agent_Platform : TGSPAA,  PSP_Agent_Platform_Out : TGSPAO, Total: TGSPA }
                , System     : { System_Platform : TGSPSS, PSP_System_Platform_Out : TGSPSO, Total: TGSPS }
                , Seller     : { PSP_Seller_Out  : TGSP_P }
                , Total      : TGSP
              }               
            , Seller_Product : { Seller_Out      : TGSP_S }
          }
          , Total            : TG
        }
      , Total                : T
    }
    , Net                    : // For adding components
    {
          Agent              : { Agent : NAN, PSP: NAP, Total: NA } // clear
        , System             : { System: NSN, PSP: NSP, Total: NS } // clear
    }
  }

  let gw = coin.Board.PSP, cut, price

  for(let i = 0; i < order_.Products.length; i++)
  {
      let item    = order_.Products[i]
      price       = item.Quantity * item.Price

      cut         = coin.Board.Category[item.Category]
      TGSP.val   += price.cut(cut)                  // Platform margin from product
      TGSP_S.val += price.cut(1 - cut)              // Sellers margin from product
  }

       T.val  = bill_.Total
      TP.val  =  T.val.cut(gw)                      // Gateway charge
      TG.val  =  T.val.cut(1- gw)                   // Residue at GW
     TGS.val  = TG.val



     TGST.val = bill_.Transit                       // Transit
     TGSP.val = TGS.val - TGSP_S.val - TGST.val     // From residue - sellers margin - transit cost = platform charge

     TGSP.val = TGSP.val.round()

  TGSP_P.val  = TGSP.val.cut(gw)                    // PSP Charge to Payout sellers margin on product

  // To Platform
   TGSPA.val  = coin.slab(TGSP.val - TGSP_P.val, Model.mode.Agent)  
  TGSPAA.val  = TGSPA.val.cut(1 - gw)
  TGSPAO.val  = TGSPA.val.cut(gw)

   TGSPS.val  = coin.slab(TGSP.val - TGSP_P.val, Model.mode.System)  
  TGSPSS.val  = TGSPS.val.cut(1 - gw)
  TGSPSO.val  = TGSPS.val.cut(gw)

  // To Transit
   TGSTA.val  = coin.split(TGST.val, Model.mode.Agent, Model.split.Transit)
  TGSTAA.val  = TGSTA.val.cut(1 - gw)
  TGSTAO.val  = TGSTA.val.cut(gw)

   TGSTS.val  = coin.split(TGST.val, Model.mode.System, Model.split.Transit)  
  TGSTSS.val  = TGSTS.val.cut(1 - gw)
  TGSTSO.val  = TGSTS.val.cut(gw)

  NAN.val     = TGSTAA.val + TGSPAA.val
  NAP.val     = TGSTAO.val + TGSPAO.val
   NA.val     =  TGSTA.val +  TGSPA.val
  
  NSN.val     = TGSTSS.val + TGSPSS.val
  NSP.val     = TGSTSO.val + TGSPSO.val
   NS.val     =  TGSTS.val +  TGSPS.val

  Log('pricing-context-created', JSON.stringify({ Ctxt: ctxt }))
	return ctxt
}

module.exports = Grid