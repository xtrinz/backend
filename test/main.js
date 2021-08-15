                  require('./lib/settings')
const { Test, TestSuite } = require('./lib/driver')
    , user      =
    {
        data  : require('./frames/user/data')
      , story : require('./frames/user/story')
    }
    , store     =
    {
        data  : require('./frames/store/data')
      , story : require('./frames/store/story')
    }
    , product   =
    {
        data  : require('./frames/product/data')
      , story : require('./frames/product/story')        
    }
    , address   =
    {
        data  : require('./frames/address/data')
      , story : require('./frames/address/story')        
    }
    , cart      =
    {
        data  : require('./frames/cart/data')
      , story : require('./frames/cart/story')        
    }
    , transit   =
    {
        story : require('./frames/transit/story')        
    }
    , journal   =
    {
        data    : require('./frames/journal/data')
      , story   : require('./frames/journal/story')        
    }

  let admin_1       = new    user.data.User    ('Admin')
    , user_1_owner  = new    user.data.User    ('User')
    , user_2_staff  = new    user.data.User    ('User')
    , user_3_buyer  = new    user.data.User    ('User')
    , agent_1       = new    user.data.User    ('Agent')
    , store_1       = new   store.data.Store   ()
    , product_1     = new product.data.Product ()
    , addr_1_user_3 = new address.data.Address ()
    
    new journal.data.Journal (user_3_buyer, addr_1_user_3, store_1, cart.data.Cart.Carts[user_3_buyer.Name])

    , user_4_owner  = new    user.data.User    ('User')
    , user_5_staff  = new    user.data.User    ('User')
    , user_6_buyer  = new    user.data.User    ('User')
    , agent_2       = new    user.data.User    ('Agent')
    , store_2       = new   store.data.Store   ()
    , product_2     = new product.data.Product ()
    , addr_1_user_6 = new address.data.Address ()

  var suite_1 = new TestSuite('End to End Process')
  let cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )
    , address.story.Std(addr_1_user_3.Address.Name, user_3_buyer.Name )
    ,    cart.story.Std(user_3_buyer.Name, product_1.Name, addr_1_user_3.Address.Name, store_1.Name)
    , transit.story.Std(user_3_buyer.Name, addr_1_user_3.Address.Name, agent_1.Name, user_1_owner.Name, user_2_staff.Name)
    
    , journal.story.Std(user_3_buyer.Name)

    ,    user.story.Disconnect(user_1_owner.Name, user_2_staff.Name, user_3_buyer.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_1.AddCase(test))

  var suite_2 = new TestSuite('E2E Cancel By User')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )
    , address.story.Std(addr_1_user_3.Address.Name, user_3_buyer.Name )
    ,    cart.story.Std(user_3_buyer.Name, product_1.Name )
    , transit.story.CancelByUser(user_3_buyer.Name, addr_1_user_3.Address.Name, agent_1.Name, user_1_owner.Name, user_2_staff.Name)
    ,    user.story.Disconnect(user_1_owner.Name, user_2_staff.Name, user_3_buyer.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_2.AddCase(test))

  var suite_3 = new TestSuite('E2E Cancel By User After Store Acceptance')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )
    , address.story.Std(addr_1_user_3.Address.Name, user_3_buyer.Name )
    ,    cart.story.Std(user_3_buyer.Name, product_1.Name )
    , transit.story.CancelByUserAfterAceptance(user_3_buyer.Name, addr_1_user_3.Address.Name, agent_1.Name, user_1_owner.Name, user_2_staff.Name)
    ,    user.story.Disconnect(user_1_owner.Name, user_2_staff.Name, user_3_buyer.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_3.AddCase(test))


  var suite_4 = new TestSuite('E2E Cancel By User After Agent Accepted The Transit')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )
    , address.story.Std(addr_1_user_3.Address.Name, user_3_buyer.Name )
    ,    cart.story.Std(user_3_buyer.Name, product_1.Name )
    , transit.story.CancelByUserAfterTransitAceptance(user_3_buyer.Name, addr_1_user_3.Address.Name, agent_1.Name, user_1_owner.Name, user_2_staff.Name)
    ,    user.story.Disconnect(user_1_owner.Name, user_2_staff.Name, user_3_buyer.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_4.AddCase(test))

  var suite_5 = new TestSuite('E2E Cancel By Store After Init')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )
    , address.story.Std(addr_1_user_3.Address.Name, user_3_buyer.Name )
    ,    cart.story.Std(user_3_buyer.Name, product_1.Name )
    , transit.story.CancellationByStoreAfterInit(user_3_buyer.Name, addr_1_user_3.Address.Name, agent_1.Name, user_1_owner.Name, user_2_staff.Name)
    ,    user.story.Disconnect(user_1_owner.Name, user_2_staff.Name, user_3_buyer.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_5.AddCase(test))

  var suite_6 = new TestSuite('E2E Cancel By Store After Accepting the order')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )
    , address.story.Std(addr_1_user_3.Address.Name, user_3_buyer.Name )
    ,    cart.story.Std(user_3_buyer.Name, product_1.Name )
    , transit.story.CancellationByStoreAfterOrderAcceptance(user_3_buyer.Name, addr_1_user_3.Address.Name, agent_1.Name, user_1_owner.Name, user_2_staff.Name)
    ,    user.story.Disconnect(user_1_owner.Name, user_2_staff.Name, user_3_buyer.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_6.AddCase(test))

  var suite_7 = new TestSuite('E2E Cancel By Store After Accepting the Transit')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )
    , address.story.Std(addr_1_user_3.Address.Name, user_3_buyer.Name )
    ,    cart.story.Std(user_3_buyer.Name, product_1.Name )
    , transit.story.CancellationByStoreAfterTransitAcceptance(user_3_buyer.Name, addr_1_user_3.Address.Name, agent_1.Name, user_1_owner.Name, user_2_staff.Name)
    ,    user.story.Disconnect(user_1_owner.Name, user_2_staff.Name, user_3_buyer.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_7.AddCase(test))

  var suite_8 = new TestSuite('Ignored By Last Agent')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )
    , address.story.Std(addr_1_user_3.Address.Name, user_3_buyer.Name )
    ,    cart.story.Std(user_3_buyer.Name, product_1.Name )
    , transit.story.IgnoredByLastAgent(user_3_buyer.Name, addr_1_user_3.Address.Name, agent_1.Name, user_1_owner.Name, user_2_staff.Name, admin_1.Name)
    ,    user.story.Disconnect(user_1_owner.Name, user_2_staff.Name, user_3_buyer.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_8.AddCase(test))

  var suite_9 = new TestSuite('Multi Store Purchase Error')
  cases =
  [
         user.story.Std(admin_1.Name )

    ,   store.story.Std(admin_1.Name, user_1_owner.Name, user_2_staff.Name, store_1.Name )
    , product.story.Std(user_2_staff.Name, store_1.Name, product_1.Name )

    ,   store.story.Std(admin_1.Name, user_4_owner.Name, user_5_staff.Name, store_2.Name )
    , product.story.Std(user_5_staff.Name, store_2.Name, product_2.Name )

    , address.story.Std(addr_1_user_3.Address.Name, user_3_buyer.Name )
    ,    cart.story.Std(user_3_buyer.Name, product_1.Name, addr_1_user_3.Address.Name, store_1.Name)

    ,    cart.story.Std(user_3_buyer.Name, product_2.Name, addr_1_user_3.Address.Name, store_2.Name)
/*    , transit.story.Std(user_3_buyer.Name, addr_1_user_3.Address.Name, agent_1.Name, user_1_owner.Name, user_2_staff.Name)
    ,    user.story.Disconnect(user_1_owner.Name, user_2_staff.Name, user_3_buyer.Name, agent_1.Name, admin_1.Name)
  */]
    cases.forEach((test)=> suite_9.AddCase(test))

    Test.AddTestSuite(suite_1)
//  Test.AddTestSuite(suite_2)
//  Test.AddTestSuite(suite_3)
//  Test.AddTestSuite(suite_4)
//  Test.AddTestSuite(suite_5)
//  Test.AddTestSuite(suite_6)
//  Test.AddTestSuite(suite_7)
//  Test.AddTestSuite(suite_8)

  Test.Run()