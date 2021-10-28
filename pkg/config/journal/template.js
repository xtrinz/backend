const { states, channel }  = require('../../system/models')

module.exports =
{ 
  Data :
  {
      _id               : ''
    , Date              : ''
    , IsRetry           : false // Pressed checkout more than once
    
    , Buyer             :
    {
        ID              : ''
      , Name            : ''
      , Address         : {} // Lat / Lon / ID/ Other Dest details
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
        Channel         : channel.Paytm
      , TransactionID   : ''
      , ChannelParams   : {}
      , Amount          : ''
      , Status          : states.Initiated
      , TimeStamp       : ''      // Webhook entry time
    }
    , Transit           : 
    {
        ID              : ''
      , State    : ''
      , Status          : states.Running
    }
    , TrialHistory      : {}
    , StaleFundEvents   : {}
    /*
      {
          Channel       : channel.Paytm
        , TransactionID : ''
        , ChannelParams : {}
        , Amount        : ''
        , Status        : states.Initiated
        , TimeStamp     : ''
      }
    */
  }
}