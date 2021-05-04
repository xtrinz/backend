const { states }                    = require("./models")
const { ObjectID, ObjectId }        = require("mongodb")
const { stores }                    = require("../connect");
const { Err, code, status, reason}  = require('../common/error')
const otp                           = require('../common/otp')
const { User }                      = require("./user")
const { mode }                      = require("./models")

function Store(data)
{
    this._id        = ''
    this.AdminID    = ObjectId(data.AdminID)
    this.Name       = data.Name
    this.Img        = data.Image
    this.Type       = data.Type
    this.Certs      = data.Certs
    this.MobileNo   = data.MobileNo
    this.Email      = data.Email
    this.Location   =
    {
          Type          : 'Point'
        , Coordinates   : [data.Longitude, data.Latitude]
    }
    this.State      = states.New
    this.Address    =
    {
          Line1         : data.Address.Line1
        , Line2         : data.Address.Line2
        , City          : data.Address.City
        , PostalCode    : data.Address.PostalCode
        , State         : data.Address.State
        , Country       : data.Address.Country
    }

    this.Set(data)
    {
        this._id        = data._id
        this.AdminID    = data.AdminID
        this.Name       = data.Name
        this.Img        = data.Img
        this.Type       = data.Type
        this.Certs      = data.Certs
        this.MobileNo   = data.MobileNo
        this.Email      = data.Email
        this.Location   = data.Location
        this.State      = data.State
        this.Address    = data.Address
    }

    this.Save       = async function()
    {
        console.log('save-store', this)
        const resp  = await users.updateOne({ _id 	 : this._id },
                                            { $set   : this	    },
                                            { upsert : true     })
        if (resp.modifiedCount !== 1) 
        {
            console.log('save-store-failed', this)
            throw new Err(code.INTERNAL_SERVER,
                          status.Failed,
                          reason.DBAdditionFailed)
        }
    }

    this.GetByID = function(_id)
    {
        console.log(`find-store-by-id. ID: ${_id}`)
        const query = { _id: _id }
        let store = await stores.findOne(query)
        if (!store)
        {
          console.log(`store-not-found. ID: ${_id}`)
          return
        }
        this.Set(store)
        console.log(`store-found. store: ${store}`)
        return store
    }

    this.DoesExist = function()
    {
        console.log(`find-store-by-primary-keys. Data: ${data}`)
        const query = { $or: [
              { AdminID  : this.AdminID, Name : this.Name }
            , { MobileNo : this.MobileNo }
        ] }
        let store = await stores.find(query)
        if (!store)
        {
          console.log(`store-does-not-exist. Data: ${data} `)
          return false
        }
        console.log(`store-exist. Data: ${data} `)
        return true
    }

    this.Read = function(store_id, user_id)
    {
        console.log(`view-store-of-user. store: ${store_id} user: ${user_id}`)
        // const query = { _id: store_id, AdminID: user_id }
        console.log(`store-list. store: `)
        return
    }

    this.GetNearbyList = async function(PageNo, Lon, Lat)
    {
        const   nPerPage = 30
              , skip     = PageNo > 0 ? (PageNo - 1)*nPerPage : 0;
        const query      = 
        { location: { $near: { $geometry: 
            { type: "Point",
              coordinates: [Lon, Lat] } } } }

        const data       = await stores.find(query).skip(skip).limit(nPerPage).toArray()
        if (data.length == 0 && pageno == 1)
        {
            console.log(`no-near-by-stores, PgNO: ${PageNo} Lon: ${Lon} Lat: ${Lat}`)
            return data
        }
        console.log(`near-by-stores-found`, data)
        return data
    }

    this.New      = async function ()
    {
        const res = await this.DoesExist()
        if (res)
        {
            throw new Err(code.BAD_REQUEST,
                          status.Failed,
                          reason.StoreExists)
        }

        const otp_sms = new otp.OneTimePasswd({
                        MobNo: 	this.MobileNo, 
                        Body: 	otp.Msgs.OnAuth })
            , hash    = otp_sms.Send(otp.Opts.SMS)

        this._id        = new ObjectID()
        this.Otp        = hash
        this.State      = states.New
        this.Save()
        console.log(`new-store-created. store: ${this}`)
    }

    this.ConfirmContactNo   = async function (data)
    {
        let store = await this.GetByMobNo(ObjectId(data.AdminID), data.MobNo)
        if (!store || store.State === states.Registered)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
            let     reason_     = reason.StoreNotFound
            if(!store) { reason_ = reason.BadState}
            throw new Err(code_, status_, reason_)
        }

        this.Set(store)

        const otp_ = new otp.OneTimePasswd({MobNo: "", Body: ""})
        if (!otp_.Confirm(this.Otp, data.OTP))
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.OtpRejected
            throw new Err(code_, status_, reason_)
        }

        this.State      = states.MobConfirmed
        this.Save()
        console.log(`store-mobile-number-confirmed. store: ${this}`)
        
        // TODO Send an event to Admin
    }

    this.Approve   = async function (data)
    {
        console.log(`store-approval. store: ${data}`)
        const user  = new User()
        const admin = user.GetByID(ObjectId(data.user._id))
        if (!admin || admin.Mode !== mode.Admin)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.PermissionDenied
            throw new Err(code_, status_, reason_)
        }

        const store = await this.GetByID(ObjectId(data.ShopID))
        if (!store || store.State !== states.MobConfirmed)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
            let     reason_     = reason.StoreNotFound
            if(!store) { reason_ = reason.BadState}
            throw new Err(code_, status_, reason_)
        }

        this.State      = states.Registered
        this.Save()
        console.log(`store-approved. store: ${this}`)
    }
    
    this.MultiGetByUserID = function(_id)
    {
        console.log(`stores-under-user. ID: ${_id}`)

        const project = 
        {
          _id   : 1,  Name  : 1,
          Type  : 1,  State : 1,
          Img   : 1 
        }

        const query = { AdminID: _id }
        const store = await stores.find(query, project)
                                  .toArray()
        if (!store.length)
        {
          console.log(`no-stores-found. ID: ${_id}`)
          return
        }
        console.log(`store-list. store: ${store}`)
        return store
    }

}

module.exports =
{
    Store: Store
}