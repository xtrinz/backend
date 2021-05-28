                  require("./lib/settings")
const { Suite } = require("./lib/driver")
    , user      = require("./frames/event/user")
    , store     = require("./frames/event/store")

 user.forEach((test)=>Suite.AddTest(test))
store.forEach((test)=>Suite.AddTest(test))

Suite.Run()