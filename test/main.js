                require('./lib/settings')
const { Test, TestSuite } = require('./lib/driver')
    , client    = { data  : require('./etc/role/client/data' ) , story : require('./etc/role/client/story' ) }
    , agent     = { data  : require('./etc/role/agent/data'  ) , story : require('./etc/role/agent/story'  ) }    
    , arbiter   = { data  : require('./etc/role/arbiter/data') , story : require('./etc/role/arbiter/story') }        
    , seller    = { data  : require('./etc/role/seller/data' ) , story : require('./etc/role/seller/story' ) }
    , note      = { data  : require('./etc/fin/note/data'   )  , story : require('./etc/fin/note/story'    ) }
    , product   = { data  : require('./etc/fin/product/data')  , story : require('./etc/fin/product/story' ) }
    , address   = { data  : require('./etc/fin/address/data')  , story : require('./etc/fin/address/story' ) }
    , cart      = { data  : require('./etc/fin/cart/data'   )  , story : require('./etc/fin/cart/story'    ) }
    , transit   = {                                              story : require('./etc/run/transit/story')  }
    , journal   = { data  : require('./etc/run/journal/data')  , story : require('./etc/run/journal/story')  }

  let arbiter_1 = new arbiter.data.Arbiter ()
    ,    note_1 = new    note.data.Note    ()
    ,  client_1 = new  client.data.Client  ()
    ,   agent_1 = new   agent.data.Agent   ()
    ,   agent_2 = new   agent.data.Agent   ()    
    ,  seller_1 = new  seller.data.Seller  ()
    , product_1 = new product.data.Product ()
    ,    addr_1 = new address.data.Address ()
    ,    cart_1 = new    cart.data.Cart    (client_1.Name)    
    , journal_1 = new journal.data.Journal (client_1, addr_1, seller_1, agent_1, cart_1, arbiter_1)

      arbiter_1 = arbiter_1.Name
         note_1 =    note_1.Name
       client_1 =  client_1.Name
         cart_1 =    cart_1.Name // belongs to client 1
        agent_1 =   agent_1.Name
        agent_2 =   agent_2.Name        
       seller_1 =  seller_1.Name
      product_1 = product_1.Name
         addr_1 =    addr_1.Name
      journal_1 = journal_1.Name

  let cases =
  [
    //   arbiter.story.Std('Add Arbiter ',        arbiter_1,                                                        journal_1         )
    // ,  client.story.Std('Add Client',                     client_1,                                              journal_1         )
    // ,   agent.story.Std('Add Agent 1',         arbiter_1,           agent_1,                                     journal_1         )
    // ,   agent.story.AddAgent('Add Agent 2',    arbiter_1,           agent_2,                                                       )    
      seller.story.Std('Add Seller ',         arbiter_1, client_1,          seller_1,                           journal_1         )
    // ,    note.story.Std('Set Notes',           arbiter_1, client_1,          seller_1, note_1                                      )
    // , product.story.Std('Add Product',                    client_1,          seller_1,        product_1,         journal_1         )
    // , address.story.Std('Set Client Address',             client_1,                                      addr_1, journal_1         )
    // ,    cart.story.Std('Add Product to Cart',            client_1,          seller_1,        product_1, addr_1, journal_1, cart_1 )
    // , 'Here You Place Transit'
    // , journal.story.Std(                                                                                         journal_1         )
    // ,  client.story.Dsc(                                  client_1                                                                 )
    // ,   agent.story.Dsc(                                            agent_1                                                        )
    // , arbiter.story.Dsc(                       arbiter_1                                                                           )
    // ,  seller.story.Dsc(                                                     seller_1                                              )
  ]

  let desc =
  [
      'End to End Process'          , 'Cash on Delivery'          , 'Immediate Cancel'
    , 'Cancelled After Assigned'    , 'Cancelled After Commit'    , 'Immediate Rejection'
    , 'Rejected After Assigned'     , 'Rejected After Commit'     , 'That man Ignored it'
  ]

  let dots =
  [
      transit.story.Std     (                   arbiter_1, client_1, agent_1, seller_1,                   addr_1, journal_1         )
    // , transit.story.COD     (                   arbiter_1, client_1, agent_1, seller_1,                   addr_1, journal_1         )
    // , transit.story.CancelA (                   arbiter_1, client_1, agent_1, seller_1,                   addr_1, journal_1         )
    // , transit.story.CancelB (                   arbiter_1, client_1, agent_1, seller_1,                   addr_1, journal_1         )
    // , transit.story.CancelC (                   arbiter_1, client_1, agent_1, seller_1,                   addr_1, journal_1         )
    // , transit.story.RejectA (                   arbiter_1, client_1, agent_1, seller_1,                   addr_1, journal_1         )
    // , transit.story.RejectB (                   arbiter_1, client_1, agent_1, seller_1,                   addr_1, journal_1         )
    // , transit.story.RejectC (                   arbiter_1, client_1, agent_1, seller_1,                   addr_1, journal_1         )
    // , transit.story.Ignore  (                   arbiter_1, client_1, agent_1, seller_1,                   addr_1, journal_1         )
  ]

  dots.forEach((dot, idx)=> {

    let suite_x =  new TestSuite(desc[idx])
    let plan    = [ ...cases ]

    //plan[9] = dot
    plan.forEach((test)=> suite_x.AddCase(test))  

    Test.AddTestSuite(suite_x) 

  })

  Test.Run()