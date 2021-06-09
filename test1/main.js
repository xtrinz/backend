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

  let admin_1       = new    user.data.User   ('Admin')
    , user_1_owner  = new    user.data.User   ('User')
    , user_2_staff  = new    user.data.User   ('User')
    , user_3_buyer  = new    user.data.User   ('User')
    , store_1       = new   store.data.Store  ()
    , product_1     = new product.data.Product()
    , addr_1        = new address.data.Address()

    , tc1 =    user.story.Std(admin_1.Name )
    , tc2 =   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , tc3 = product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )
    , tc4 = address.story.Std(addr_1.Address.Name, user_3_buyer.Name )
    , tc5 =    cart.story.Std(user_3_buyer.Name, product_1.Name )

  const tc = [ tc1, tc2, tc3, tc4, tc5 ]
  tc.forEach((test)=> Suite.AddTest(test))

  Suite.Run()