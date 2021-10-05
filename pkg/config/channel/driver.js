const { ObjectID, ObjectId } = require('mongodb')
    , db           =
    {
        user       : require('../user/archive')
    }
    , { Err_ }     = require('../../system/models')
    , tally        = require('../../system/tally')

function Channel()
{
  this.Data =
  {
      _id               : ''
    , Date              : ''
    , IsRetry           : false // Pressed checkout more than once
    
    , Buyer             :
    {
        ID              : ''
      , Name            : ''
      , Longitude       : 0
      , Latitude        : 0
      , Address         : {}
    }
    , Seller            :
    {
        ID              : ''
      , Name            : ''
      , Longitude       : 0
      , Latitude        : 0
      , Address         : {}
    }
    , Agent             :
    {
        ID              : ''
      , Name            : ''
      , MobileNo        : ''
    }
    , Agents            : [] // { ID: , Earnings: { FirstMile | SecondMile | Penalty | ReasonForPenalty |  }}
    , Order             :
    {
        Products        : [] // ProductID, Name, Price, Image, CategoryID, Quantity, Available, Flagged 
      , Bill            : 
      {
          Total         : 0
        , TransitCost   : 0
        , Tax           : 0
        , NetPrice      : 0
      }
    }
    , Payment           :
    {
      //  Channel         : channel.Paytm
      //, TransactionID   : ''
        ChannelParams   : {}
      , Amount          : ''
      //, Status          : states.Initiated
      , TimeStamp       : ''      // Webhook entry time
    }
    , Transit           : 
    {
        ID              : ''
      , State           : ''
      //, Status          : states.Running
    }
  }
}

module.exports =
{
  Channel: Channel
}