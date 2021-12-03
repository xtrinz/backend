const { verb, mode } = require('../../system/models')

module.exports =
{
    [verb.view]:
    {
        [mode.User]:
        {
            _id                   : 1  
         , 'Date'                 : 1  
         
         , 'Buyer.Address'        : 1

         , 'Agent.Name'           : 1  , 'Agent.MobileNo'       : 1

         , 'Store.ID'             : 1  , 'Store.Name'           : 1
         , 'Store.Address'        : 1  , 'Store.Image'          : 1

         , 'Order.Products'       : 1  , 'Bill'                 : 1

         , 'Payment.Channel'      : 1  , 'Payment.Amount'       : 1
         , 'Payment.Status'       : 1  , 'Payment.Time.Webhook' : 1

         , 'Transit.ID'           : 1  , 'Transit.Status'       : 1
         , 'Transit.State'        : 1
       }

       , [mode.Agent]:
       {
                _id                   : 1  , 'Date'              : 1

            , 'Seller.Name'          : 1  , 'Seller.MobileNo'   : 1
            , 'Seller.Address'       : 1  , 'Seller.Image'      : 1

            , 'Buyer.Name'           : 1
            , 'Buyer.Address'        : 1  , 'Buyer.MobileNo'    : 1
            , 'Buyer.Longitude'      : 1  , 'Buyer.Latitude'    : 1

            , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
            , 'Transit.State' : 1

            , 'Account.In.Static.Penalty.Agent' : 1
            , 'Account.Out.Static.Payout.Agent' : 1
        }
        , [mode.Store]:
        {
            _id                   : 1  , 'Date'              : 1
         , 'Buyer.Name'           : 1
         , 'Agent.Name'           : 1  , 'Agent.MobileNo'    : 1
         , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
         , 'Transit.State' : 1
         , 'Order.Products'       : 1  , 'Order.Bill.Total'  : 1
         , 'Account.In.Static.Penalty.Store' : 1
         , 'Account.Out.Static.Payout.Store' : 1
       }
       , [mode.Admin]:
       {
                _id                  : 1  , 'Date'            : 1
            
            , 'Buyer.Name'           : 1
            , 'Buyer.Address'        : 1  , 'Buyer.MobileNo'  : 1

            , 'Seller.ID'            : 1  , 'Seller.Name'     : 1
            , 'Seller.Address'       : 1  , 'Seller.Image'    : 1
            , 'Seller.MobileNo'      : 1
            
            , 'Agent.Name'           : 1  , 'Agent.MobileNo'  : 1

            , 'Payment.Channel'      : 1  , 'Payment.Amount'    : 1
            , 'Payment.Status'       : 1  , 'Payment.TimeStamp' : 1

            , 'Transit.ID'           : 1  , 'Transit.Status'  : 1
            , 'Transit.State' : 1

            , 'Order.Products'       : 1  , 'Order.Bill'      : 1
            , 'Account.In.Static.Penalty'        : 1
            , 'Account.Out.Dynamic.Refund.Buyer' : 1
        }
    }
}