let Transit =
{
    _id 		    : ''
  , JournalID       : ''
  , Store 		    :
  {
        _id         : ''
      , SockID      : []
      , Name        : ''
      , Longitude   : ''
      , Latitude    : ''
      , MobileNo    : ''
      , Address     : ''
  }

  , User 		    : 
  {
        _id         : ''
      , SockID      : []
      , Name        : ''
      , Longitude   : ''
      , Latitude    : ''          
      , MobileNo    : ''
      , Address     : ''
  }

  , Agent           : {}
  , Agents          : []                                    // Pool of live agents filtered for transit
  , Return 	        : ""                                    // Machine's prev-state for fallbacks
  , State 		    : states.None                           // Machine init state
  , Event 		    : events.EventInitiationByUser          // Machine init event
  , MaxWT           : 35                                    // Maximum Waiting Time (35min)
  , OrderedAt 	    : Date.now()                            // Millis / https://currentmillis.com/
  , ETD   		    : 0                                     // Estimated Time of Delivery
}

module.exports =
{
    Transit : Transit
}