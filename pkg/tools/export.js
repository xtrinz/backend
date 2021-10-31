const Model    = require('../system/models')

    , Tools    =
{
      [Model.resource.agent]:
    {
          filter   : require('./filter/agent'    )
        , project  : require('./project/agent'   )
        , rinse    : require('./rinse/agent'     )
    }
    , [Model.resource.store]:
    {
          project  : require('./project/store'   )
        , rinse    : require('./rinse/store'     )
    }    
    , [Model.resource.journal]:
    {
          filter   : require('./filter/journal'  )
        , project  : require('./project/journal' )
        , rinse    : require('./rinse/journal'   )
    }        
    , [Model.resource.product]:
    {
          project  : require('./project/product' )
        , rinse    : require('./rinse/product'   )
    }            
}

module.exports = Tools