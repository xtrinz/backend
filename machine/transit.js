const {states, events, entity}		= require("./models")
const { ObjectID } 					= require("mongodb")
const { transits } 					= require("../database/connect")
const { Err, code, status, reason } = require("../common/error")

function NewTransit ( order_id,
                      user_id, user_lng, user_lat, user_sock_ids,
                      shop_id, shop_lng, shop_lat, shop_sock_ids)
{
    this._id 		= new ObjectID()
    this.OrderID    = order_id
    // Shop attributes
    this.Shop 		=
    {
        _id         : shop_id,
        SockID      : shop_sock_ids,
        Name        : 'x',
        ContactNo   : 'y',
        Location    :
        {
            Lng     : shop_lng,
            Lat     : shop_lat
        }
    }
    // User attributes
    this.User 		= 
    {
        _id         : user_id,
        SockID      : user_sock_ids,
        Name        : 'x',
        ContactNo   : 'y',
        Location    :
        {
            Lng     : user_lng,
            Lat     : user_lat
        }
    }
    // Machine's previous state for expected fallback scenarios.
    // Eg: Return = TransitAccepted or OrderDespatched for TransitRejected
    this.Return 	= ""
    // Machine init state
    this.State 		= states.None
    // Machine init event
    this.Event 		= events.EventInitiationByUser
    // Maximum Waiting Time (35min)
    this.MaxWT      = 35
    // Format: 	Millis
    // Ref: 	https://currentmillis.com/
    this.OrderedAt 	= Date.now()
    // Estimated Time of Delivery
    this.ETD   		= function()
    {
        let etd
        /*const start = Date.now()
        const millis = Date.now() - start
        const delay = Math.floor(millis / (1000*60))
        console.log(`min elapsed = ${delay}`);
        */
        // Write algorithm to calcuate 
        // Estimated Time of Delivery(ETD)
        // using cordinates of user and shop
        return etd
    }()

    // Returns time spend(in min) since order placed
    this.Delay      = function()
    {
        const   now    = Date.now()
              , millis = now - this.OrderedAt
              , delay  = Math.floor(millis / (1000*60))
        console.log(`time elapsed in min: ${delay}`)
        return delay
    } 

    this.Abstract   = function(...args)
    {
        let obj =
        {
            TransitID   : this._id
          , OrderID	    : this.OrderID
          , UserID 	    : this.User._id
          , UserName 	: this.User.Name
          , ShopID 	    : this.Shop._id
          , ShopName 	: this.Shop.Name
        }

        if (this.Agent && !args.includes(entity.Agent))
        {
            obj.AgentID        = this.Agent._id
            obj.AgentName      = this.Agent.Name
            obj.AgentContactNo = this.Agent.ContactNo
        }

        if (this.Admin && !args.includes(entity.Admin))
        {
            obj.AdminID        = this.Admin._id
            obj.AdminName      = this.Admin.Name
        }

        return obj
    }

    this.Save       = async function()
    {
        try
        {
            console.log('set-transit-record-to-db', this)
            const resp  = await transits.updateOne(	{ _id 	 : this._id },
                                                    { $set   : this	    },
                                                    { upsert : true     })
            if (resp.modifiedCount !== 1) { throw new Error('no-record-found') }
        }
        catch(err)
        {
            console.log('transit-record-addition-failed', err, this)
            throw new Err(code.INTERNAL_SERVER,
                        status.Failed,
                        reason.DBAdditionFailed)
        }
    }
    console.log(`new-transit. doc: ${this}`)
}

module.exports =
{
    NewTransit	: NewTransit
}