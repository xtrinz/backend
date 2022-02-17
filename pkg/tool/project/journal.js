const { verb, mode } = require('../../sys/models')

module.exports =
{
    [verb.view]:
    {
        [mode.Client]:
        {
            _id                         : 1  
         , 'Date'                       : 1  
         
         , 'Client.Address'              : 1

         , 'Agent.Name'                 : 1  , 'Agent.MobileNo'       : 1

         , 'Seller.ID'                   : 1  , 'Seller.Name'           : 1
         , 'Seller.Address'              : 1  , 'Seller.Image'          : 1

         , 'Order.Products.Quantity'    : 1
         , 'Order.Products.Name'        : 1  , 'Bill'                 : 1

         , 'Payment.Channel'            : 1  , 'Payment.Amount'       : 1
         , 'Payment.Status'             : 1  , 'Payment.Time.Webhook' : 1

         , 'Transit.ID'                 : 1  , 'Transit.Status'       : 1
         , 'Transit.State'              : 1
       }

       , [mode.Agent]:
       {
                _id                   : 1  , 'Date'              : 1

            , 'Seller.Name'          : 1    , 'Seller.MobileNo'   : 1
            , 'Seller.Address'       : 1    , 'Seller.Image'      : 1

            , 'Client.Name'           : 1
            , 'Client.Address'        : 1  , 'Client.MobileNo'    : 1
            , 'Client.Longitude'      : 1  , 'Client.Latitude'    : 1

            , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
            , 'Transit.State' : 1

        }
        , [mode.Seller]:
        {
            _id                   : 1  , 'Date'              : 1
         , 'Client.Name'           : 1
         , 'Agent.Name'           : 1  , 'Agent.MobileNo'    : 1
         , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
         , 'Transit.State' : 1
         , 'Order.Products'       : 1  , 'Order.Bill.Total'  : 1

        }
       , [mode.Arbiter] :    
       {
            'Agent.OTP'           : 0  , 'Payment.Token'     : 0
       }
    }
    , [verb.list]:
    {
        [mode.Client]:
        {
            _id                         : 1  
         , 'Date'                       : 1  
         
         , 'Client.Address'              : 1

         , 'Agent.Name'                 : 1  , 'Agent.MobileNo'       : 1

         , 'Seller.ID'                   : 1  , 'Seller.Name'           : 1
         , 'Seller.Address'              : 1  , 'Seller.Image'          : 1

         , 'Order.Products.Quantity'    : 1
         , 'Order.Products.Name'        : 1  , 'Bill'                 : 1

         , 'Payment.Channel'            : 1  , 'Payment.Amount'       : 1
         , 'Payment.Status'             : 1  , 'Payment.Time.Webhook' : 1

         , 'Transit.ID'                 : 1  , 'Transit.Status'       : 1
         , 'Transit.State'              : 1
       }

       , [mode.Agent]:
       {
                _id                   : 1  , 'Date'              : 1

            , 'Seller.Name'          : 1    , 'Seller.MobileNo'   : 1
            , 'Seller.Address'       : 1    , 'Seller.Image'      : 1

            , 'Client.Name'           : 1
            , 'Client.Address'        : 1  , 'Client.MobileNo'    : 1
            , 'Client.Longitude'      : 1  , 'Client.Latitude'    : 1

            , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
            , 'Transit.State' : 1

        }
        , [mode.Seller]:
        {
            _id                   : 1  , 'Date'              : 1
         , 'Client.Name'           : 1
         , 'Agent.Name'           : 1  , 'Agent.MobileNo'    : 1
         , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
         , 'Transit.State' : 1
         , 'Order.Products'       : 1  , 'Order.Bill.Total'  : 1

        }
       , [mode.Arbiter]:
       {
                _id           : 1  , 'Time.Created'    : 1
            , 'Client.Name'   : 1  , 'Seller.Name'     : 1
            , 'Agent.Name'    : 1  , 'Agent.MobileNo'  : 1
            , 'Transit.State' : 1  , 'Bill.Total'      : 1
        }
    }    
}