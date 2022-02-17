const Model    = require('../sys/models')

const Segments =
{
    [Model.segment.db]:
    {
          [Model.resource.address] : require('./fin/address/archive'  )
        , [Model.resource.cart]    : require('./fin/cart/archive'     )
        , [Model.resource.product] : require('./fin/product/archive'  ) 
        , [Model.resource.note]    : require('./fin/note/archive'     )    
        , [Model.resource.ledger]  : require('./fin/ledger/archive'   )
        , [Model.resource.transit] : require('./run/transit/archive'  )   
        , [Model.resource.journal] : require('./run/journal/archive'  )                 
        , [Model.resource.agent]   : require('./role/agent/archive'   )
        , [Model.resource.arbiter] : require('./role/arbiter/archive' )
        , [Model.resource.client]  : require('./role/client/archive'  )
        , [Model.resource.seller]  : require('./role/seller/archive'  )            
    }
}

module.exports = Segments