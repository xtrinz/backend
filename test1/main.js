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
    let admin_1  = new user.data.User('Admin')
      , tc1      = user.story.Std(admin_1.Name)
    Suite.AddTest(tc1)

    let owner_user_1  = new  user.data.User('User')
      , staff_user_1  = new  user.data.User('User')
      , store_1       = new  store.data.Store()
      , tc2           = store.story.Std(
                            admin_1.Name
                          , owner_user_1.Name
                          , staff_user_1.Name
                          , store_1.Name)
    Suite.AddTest(tc2)

    Suite.Run()