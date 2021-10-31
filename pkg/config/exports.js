const Model    = require('../system/models')

const Segments =
{
    [Model.segment.db]:
    {
          [Model.resource.address] : require('./address/archive' )
        , [Model.resource.agent]   : require('./agent/archive'   )
        , [Model.resource.cart]    : require('./cart/archive'    )
        , [Model.resource.product] : require('./product/archive' )
        , [Model.resource.store]   : require('./store/archive'   )
        , [Model.resource.transit] : require('./transit/archive' )
        , [Model.resource.user]    : require('./user/archive'    )   
        , [Model.resource.journal] : require('./journal/archive' )  
        , [Model.resource.note]    : require('./note/archive' )                                
    }
}

module.exports = Segments