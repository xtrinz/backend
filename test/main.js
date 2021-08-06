                  require('./lib/settings')
const { Test, TestSuite } = require('./lib/driver')
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
    , transit   =
    {
        story : require('./frames/story/transit')        
    }

  let admin_1       = new    user.data.User    ('Admin')
    , user_1_owner  = new    user.data.User    ('User')
    , user_2_staff  = new    user.data.User    ('User')
    , user_3_buyer  = new    user.data.User    ('User')
    , agent_1       = new    user.data.User    ('Agent')
    , store_1       = new   store.data.Store   ()
    , product_1     = new product.data.Product ()
    , addr_1_user_3 = new address.data.Address ()
    
  var suite_1 = new TestSuite('End to End Process')
  let cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )
    , address.story.Std(addr_1_user_3.Address.Name, user_3_buyer.Name )
    ,    cart.story.Std(user_3_buyer.Name, product_1.Name, addr_1_user_3.Address.Name, store_1.Name)
    , transit.story.Std(user_3_buyer.Name, addr_1_user_3.Address.Name, agent_1.Name, user_1_owner.Name, user_2_staff.Name)
    ,    user.story.Disconnect(user_1_owner.Name, user_2_staff.Name, user_3_buyer.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_1.AddCase(test))

  Test.AddTestSuite(suite_1)

  Test.Run()