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
    , admin     =
    {
        data  : require('./frames/admin/data')
      , story : require('./frames/admin/story')
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

  let admin_1       = new   admin.data.Admin   ('Admin')
    , note_         = new    note.data.Note    ()
    , client_1      = new    user.data.User    ('User')
    , agent_1       = new   agent.data.Agent   ('Agent')
    , store_1       = new   store.data.Store   ()
    , product_1     = new product.data.Product ()
    , client_1_addr = new address.data.Address ()
    
    new journal.data.Journal (client_1, client_1_addr, store_1, cart.data.Cart.Carts[client_1.Name], agent_1)

    admin_1         = admin_1.Name    
    note_           = note_.Name  
    client_1        = client_1.Name      
    agent_1         = agent_1.Name    
    store_1         = store_1.Name    
    product_1       = product_1.Name      
    client_1_addr   = client_1_addr.Name              

  var suite_1 = new TestSuite('End to End Process')
  let cases =
  [
        admin.story.Std('Add Admin ',               admin_1)
    ,    user.story.Std('Add Client',              client_1)
    ,   agent.story.Std('Add Agent ',               agent_1,       admin_1)
    ,   store.story.Std('Add Store ',               store_1,       admin_1,     client_1)
    ,    note.story.Std('Set Notes',                  note_,       admin_1,     client_1,   store_1)
    , product.story.Std('Add Product',              store_1,     product_1,     client_1)
    , address.story.Std('Set Client Address', client_1_addr,                    client_1)
    ,    cart.story.Std('Add Product to Cart', client_1,         product_1, client_1_addr,                 store_1)
    , transit.story.Std(client_1,             client_1_addr,       agent_1,                 store_1)
    , journal.story.Std(client_1,                   store_1,       agent_1,       admin_1,  client_1_addr)
    ,    user.story.Disconnect(client_1)
    ,   agent.story.Disconnect(agent_1)
    ,   admin.story.Disconnect(admin_1)    
    ,   store.story.Disconnect(store_1)
  ]
  cases.forEach((test)=> suite_1.AddCase(test))


  var suite_2 = new TestSuite('End to End Process - COD')
  cases =
  [
         user.story.Std('Add Admin ',               admin_1)
    ,    user.story.Std('Add Client',              client_1)
    ,    note.story.Std('Set Notes',                  note_,   admin_1, client_1)         
    ,   agent.story.Std('Add Agent ',               agent_1,   admin_1)
    ,   store.story.Std('Add Store',               store_1,   admin_1, client_1)
    , product.story.Std('Add Product',              store_1, product_1, client_1)
    , address.story.Std('Set Client Address', client_1_addr,  client_1 )
    ,    cart.story.Std(client_1, product_1, client_1_addr, store_1)
    , transit.story.Std(client_1, client_1_addr, agent_1, store_1)
    , journal.story.Std(client_1, store_1, agent_1, admin_1, client_1_addr)
    ,    user.story.Disconnect(client_1, admin_1)
    ,   agent.story.Disconnect(agent_1)
    ,   store.story.Disconnect(store_1)
  ]
  cases.forEach((test)=> suite_2.AddCase(test))

  Test.AddTestSuite(suite_1)

  Test.Run()