const { states, type, channel } = require("../../../pkg/common/models")

let Journal =
{
    _id               : ''
  , Status            : states.None
  , Type              : type.FORWARD
  , CartID            : ''
  , ReturnID          : ''
  , Date              : ''          // Millis eases math
  , Products          : []
  , Bill              : 
  {
      Total           : 297
    , TransitCost     : 0
    , Tax             : 0
    , NetPrice        : 297
  }
}

module.exports =
{
    Journal: Journal
}