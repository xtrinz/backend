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

    // User Management
    let user_ = user.data.Admin
      , tc1   = user.story.Std(user_)
    Suite.AddTest(tc1)

    // Store Management
  /*let user_  = user.data.Customer
      , tc     = user.story.AddUser(user_)*/
    let store_ = store.data.Store
      , tc2    = store.story.Std(store_)
    Suite.AddTest(tc2)

    Suite.Run()