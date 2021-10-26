                  require('./lib/settings')
const { Test, TestSuite } = require('./lib/driver')
    , note      =
    {
        data  : require('./frames/note/data')
      , story : require('./frames/note/story')
    }
    , user      =
    {
        data  : require('./frames/user/data')
      , story : require('./frames/user/story')
    }
    , agent     =
    {
        data  : require('./frames/agent/data')
      , story : require('./frames/agent/story')
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
    , note_         = new    note.data.Note    ()
    , client_1      = new    user.data.User    ('User')
    , agent_1       = new   agent.data.Agent   ('Agent')
    , store_1       = new   store.data.Store   ()
    , product_1     = new product.data.Product ()
    , client_1_addr = new address.data.Address ()
    
    new journal.data.Journal (client_1, client_1_addr, store_1, cart.data.Cart.Carts[client_1.Name], agent_1)

  var suite_1 = new TestSuite('End to End Process')
  let cases =
  [
         user.story.Std('Add Admin ',               admin_1.Name)
    ,    user.story.Std('Add Client',              client_1.Name)
    ,    note.story.Std('Set Notes',                  note_.Name,   admin_1.Name, client_1.Name)         
    ,   agent.story.Std('Add Agent ',               agent_1.Name,   admin_1.Name)
    ,   store.story.Std('Add Seller',               store_1.Name,   admin_1.Name, client_1.Name)
    , product.story.Std('Add Product',              store_1.Name, product_1.Name, client_1.Name)
    , address.story.Std('Set Client Address', client_1_addr.Name,  client_1.Name )
    ,    cart.story.Std(client_1.Name, product_1.Name, client_1_addr.Name, store_1.Name)
    , transit.story.Std(client_1.Name, client_1_addr.Name, agent_1.Name, store_1.Name)
    , journal.story.Std(client_1.Name, store_1.Name, agent_1.Name, admin_1.Name, client_1_addr.Name)
    ,    user.story.Disconnect(client_1.Name, admin_1.Name)
    ,   agent.story.Disconnect(agent_1.Name)
    ,   store.story.Disconnect(store_1.Name)
  ]
  cases.forEach((test)=> suite_1.AddCase(test))


/*

  let user_4_owner  = new    user.data.User    ('User')
    , user_6_buyer  = new    user.data.User    ('User')
    , agent_2       = new   agent.data.Agent   ('Agent')
    , store_2       = new   store.data.Store   ()
    , product_2     = new product.data.Product ()
    , addr_1_user_6 = new address.data.Address ()

  var suite_2 = new TestSuite('E2E Cancel By User')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, client_1.Name, client_1.Name, store_1.Name )
    , product.story.Std(client_1.Name, store_1.Name, product_1.Name )
    , address.story.Std(client_1_addr.Address.Name, client_1.Name )
    ,    cart.story.Std(client_1.Name, product_1.Name )
    , transit.story.CancelByUser(client_1.Name, client_1_addr.Address.Name, agent_1.Name, client_1.Name, client_1.Name)
    ,    user.story.Disconnect(client_1.Name, client_1.Name, client_1.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_2.AddCase(test))

  var suite_3 = new TestSuite('E2E Cancel By User After Store Acceptance')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, client_1.Name, client_1.Name, store_1.Name )
    , product.story.Std(client_1.Name, store_1.Name, product_1.Name )
    , address.story.Std(client_1_addr.Address.Name, client_1.Name )
    ,    cart.story.Std(client_1.Name, product_1.Name )
    , transit.story.CancelByUserAfterAceptance(client_1.Name, client_1_addr.Address.Name, agent_1.Name, client_1.Name, client_1.Name)
    ,    user.story.Disconnect(client_1.Name, client_1.Name, client_1.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_3.AddCase(test))


  var suite_4 = new TestSuite('E2E Cancel By User After Agent Accepted The Transit')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, client_1.Name, client_1.Name, store_1.Name )
    , product.story.Std(client_1.Name, store_1.Name, product_1.Name )
    , address.story.Std(client_1_addr.Address.Name, client_1.Name )
    ,    cart.story.Std(client_1.Name, product_1.Name )
    , transit.story.CancelByUserAfterTransitAceptance(client_1.Name, client_1_addr.Address.Name, agent_1.Name, client_1.Name, client_1.Name)
    ,    user.story.Disconnect(client_1.Name, client_1.Name, client_1.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_4.AddCase(test))

  var suite_5 = new TestSuite('E2E Cancel By Store After Init')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, client_1.Name, client_1.Name, store_1.Name )
    , product.story.Std(client_1.Name, store_1.Name, product_1.Name )
    , address.story.Std(client_1_addr.Address.Name, client_1.Name )
    ,    cart.story.Std(client_1.Name, product_1.Name )
    , transit.story.CancellationByStoreAfterInit(client_1.Name, client_1_addr.Address.Name, agent_1.Name, client_1.Name, client_1.Name)
    ,    user.story.Disconnect(client_1.Name, client_1.Name, client_1.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_5.AddCase(test))

  var suite_6 = new TestSuite('E2E Cancel By Store After Accepting the order')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, client_1.Name, client_1.Name, store_1.Name )
    , product.story.Std(client_1.Name, store_1.Name, product_1.Name )
    , address.story.Std(client_1_addr.Address.Name, client_1.Name )
    ,    cart.story.Std(client_1.Name, product_1.Name )
    , transit.story.CancellationByStoreAfterOrderAcceptance(client_1.Name, client_1_addr.Address.Name, agent_1.Name, client_1.Name, client_1.Name)
    ,    user.story.Disconnect(client_1.Name, client_1.Name, client_1.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_6.AddCase(test))

  var suite_7 = new TestSuite('E2E Cancel By Store After Accepting the Transit')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, client_1.Name, client_1.Name, store_1.Name )
    , product.story.Std(client_1.Name, store_1.Name, product_1.Name )
    , address.story.Std(client_1_addr.Address.Name, client_1.Name )
    ,    cart.story.Std(client_1.Name, product_1.Name )
    , transit.story.CancellationByStoreAfterTransitAcceptance(client_1.Name, client_1_addr.Address.Name, agent_1.Name, client_1.Name, client_1.Name)
    ,    user.story.Disconnect(client_1.Name, client_1.Name, client_1.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_7.AddCase(test))

  var suite_8 = new TestSuite('Ignored By Last Agent')
  cases =
  [
         user.story.Std(admin_1.Name )
    ,   store.story.Std(admin_1.Name, client_1.Name, client_1.Name, store_1.Name )
    , product.story.Std(client_1.Name, store_1.Name, product_1.Name )
    , address.story.Std(client_1_addr.Address.Name, client_1.Name )
    ,    cart.story.Std(client_1.Name, product_1.Name )
    , transit.story.IgnoredByLastAgent(client_1.Name, client_1_addr.Address.Name, agent_1.Name, client_1.Name, client_1.Name, admin_1.Name)
    ,    user.story.Disconnect(client_1.Name, client_1.Name, client_1.Name, agent_1.Name, admin_1.Name)
  ]
  cases.forEach((test)=> suite_8.AddCase(test))

  var suite_9 = new TestSuite('Multi Store Purchase Error')
  cases =
  [
         user.story.Std(admin_1.Name )

    ,   store.story.Std(admin_1.Name, client_1.Name, client_1.Name, store_1.Name )
    , product.story.Std(client_1.Name, store_1.Name, product_1.Name )

    ,   store.story.Std(admin_1.Name, user_4_owner.Name, user_4_owner.Name, store_2.Name )
    , product.story.Std(user_4_owner.Name, store_2.Name, product_2.Name )

    , address.story.Std(client_1_addr.Address.Name, client_1.Name )
    ,    cart.story.Std(client_1.Name, product_1.Name, client_1_addr.Address.Name, store_1.Name)

    ,    cart.story.Std(client_1.Name, product_2.Name, client_1_addr.Address.Name, store_2.Name)
    , transit.story.Std(client_1.Name, client_1_addr.Address.Name, agent_1.Name, client_1.Name, client_1.Name)
    ,    user.story.Disconnect(client_1.Name, client_1.Name, client_1.Name, agent_1.Name, admin_1.Name)
    ]
    cases.forEach((test)=> suite_9.AddCase(test))
*/
    Test.AddTestSuite(suite_1)
//  Test.AddTestSuite(suite_2)
//  Test.AddTestSuite(suite_3)
//  Test.AddTestSuite(suite_4)
//  Test.AddTestSuite(suite_5)
//  Test.AddTestSuite(suite_6)
//  Test.AddTestSuite(suite_7)
//  Test.AddTestSuite(suite_8)

  Test.Run()