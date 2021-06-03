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
    , transit   =
    {
        data  : require('./frames/data/transit')
      , story : require('./frames/story/transit')        
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
    let cart_    = cart.data.Cart
      , tc5      = cart.story.Std(cart_)
    Suite.AddTest(tc5)

    // Journal Management
    let journal_ = journal.data.Journal
      , tc6      = journal.story.Std(journal_)
    Suite.AddTest(tc6)

    // Transit Events
    let transit_ = transit.data.Transit
      , tc7      = transit.story.Std(transit_)
    Suite.AddTest(tc7)

    Suite.Run()