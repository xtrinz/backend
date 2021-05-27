                  require("./lib/settings")
const { Suite } = require("./lib/driver")
const user      = require("./frames/event/user")

user.forEach((test)=>Suite.AddTest(test))

Suite.Run()