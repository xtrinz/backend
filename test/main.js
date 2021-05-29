                  require("./lib/settings")
const { Suite } = require("./lib/driver")
/*  , store     = require("./frames/store")
    store.forEach((test)=>Suite.AddTest(test))*/
    user      =
    {
        data  : require('./frames/data/user')
      , story : require('./frames/story/user')
    }
    store      =
    {
        data  : require('./frames/data/user')
      , story : require('./frames/story/user')
    }

    // User Management
    let user_ = user.data.Customer
      , tc    = user.story.Std(user_)
    Suite.AddTest(tc)

    // Store Management
    let user_ = data.Customer
      , tc    = story.Std(user_)
    //Suite.AddTest(tc)

    Suite.Run()