                  require("./lib/settings")
const { Suite } = require("./lib/driver")
    , user      =
    {
        data  : require('./frames/data/user')
      , story : require('./frames/story/user')
    }
    , store     =
    {
        data  : require('./frames/data/store')
      , story : require('./frames/story/store')
    }
    , product   =
    {
        data  : require('./frames/data/product')
      , story : require('./frames/story/product')        
    }
    , address   =
    {
        data  : require('./frames/data/address')
      , story : require('./frames/story/address')        
    }
    , cart      =
    {
        data  : require('./frames/data/cart')
      , story : require('./frames/story/cart')        
    }
    , journal   =
    {
        data  : require('./frames/data/journal')
      , story : require('./frames/story/journal')        
    }

    // User Management
    let user_    = user.data.Admin
      , tc1      = user.story.Std(user_)
    Suite.AddTest(tc1)

    // Store Management
    let store_   = store.data.Store
      , tc2      = store.story.Std(store_)
    Suite.AddTest(tc2)

    // Product Management
    let product_ = product.data.Product
      , tc3      = product.story.Std(product_)
    Suite.AddTest(tc3)

    // Address Management
    let addr_    = address.data.Address
      , tc4      = address.story.Std(addr_)
    Suite.AddTest(tc4)

    // Cart Management
    let cart_    = cart.data.CartEntry
      , tc5      = cart.story.Std(cart_, product_)
    Suite.AddTest(tc5)

    // Journal Management
    const tc6    = journal.story.Std(product_, cart_, addr_)
    Suite.AddTest(tc6)

    Suite.Run()