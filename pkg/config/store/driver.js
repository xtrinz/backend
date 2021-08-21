const { ObjectID }           = require('mongodb')
    , otp                    = require('../../infra/otp')
    , { Err_, code, reason}  = require('../../common/error')
    , { states, mode
      , query, message, gw } = require('../../common/models')
    , db                     = 
    {
          store   : require('../store/archive')
        , user    : require('../user/archive')
    }

function Store(data)
{
    if (data)
    this.Data             =
    {
          _id             : ''
        , AdminID         : data.User._id
        , Email           : data.Email
        , Image           : data.Image
        , Certs           : data.Certs
        , Type            : data.Type

        , Name            : data.Name
        , MobileNo        : data.MobileNo
        , Location        :
        {
              type        : 'Point'
            , coordinates : [data.Longitude, data.Latitude]
        }
        , Address         :
        {
              Line1       : data.Address.Line1
            , Line2       : data.Address.Line2
            , City        : data.Address.City
            , PostalCode  : data.Address.PostalCode
            , State       : data.Address.State
            , Country     : data.Address.Country
        }
        , State           : states.New
        , StaffList       :
        {
              Approved    : []
            , Pending     : []
        }
    }

    this.Read = async function(store_id, user_id)
    {
        console.log('read-store', { StoreID: store_id, UserID: user_id })
    
        this.Data = await db.store.Get(store_id, query.ByID)
        if (!this.Data) Err_(code.BAD_REQUEST, reason.StoreNotFound)
    
        let data =
        {
            StoreID   : this.Data._id
          , Email     : this.Data.Email
          , State     : this.Data.State
          , Image     : this.Data.Image
          , Certs     : this.Data.Certs
          , Type      : this.Data.Type
          , Name      : this.Data.Name
          , MobileNo  : this.Data.MobileNo
          , Longitude : this.Data.Location.coordinates[0]
          , Latitude  : this.Data.Location.coordinates[1]
          , Address   : this.Data.Address
        }
        if (String(this.Data.AdminID) !== String(user_id))
        {
            if (data.State !== states.Registered)
            Err_(code.FORBIDDEN, reason.PermissionDenied)

            delete data.State
        }
        console.log('store-read', { Store : data })
        return data
    }

    this.GetLoc = async function(store_id)
    {
        console.log('get-store-location', { StoreID: store_id })

        this.Data = await db.store.Get(store_id, query.ByID)
        if (!this.Data) Err_(code.BAD_REQUEST, reason.StoreNotFound)
        let data =
        {
            Longitude : this.Data.Location.coordinates[0]
          , Latitude  : this.Data.Location.coordinates[1]
        }

        console.log('store-location-found', { StoreID: store_id, Loc : data })
        return data
    }
    
    // Authz usr for product mgmt
    this.Authz      = async function(StoreID, UserID) 
    {
        this.Data = await db.store.Get(StoreID, query.ByID)
        if (!this.Data) Err_(code.BAD_REQUEST, reason.StoreNotFound)
    
        if(!this.Data.StaffList.Approved.includes(String(UserID)) && 
            (String(this.Data.AdminID) !== String(UserID)))
            Err_(code.BAD_REQUEST, reason.Unauthorized)
    }
    
    this.New      = async function ()
    {
        // Check admin have shop with same name
        const key1 = { AdminID  : this.Data.AdminID, Name : this.Data.Name }
            , res1 = await db.store.Get(key1, query.Custom)
        if (res1 && res1.State === states.Registered)
        Err_(code.BAD_REQUEST, reason.StoreExists)
    
        // Check the mobile number already used
        const key2 = { MobileNo : this.Data.MobileNo }
            , res2 = await db.store.Get(key2, query.Custom)
        if (res2 && res1.State === states.Registered)
        Err_(code.BAD_REQUEST, reason.Unauthorized)
    
        const otp_sms = new otp.OneTimePasswd({
                        MobileNo: 	this.Data.MobileNo, 
                        Body: 	message.OnAuth })
            , hash    = await otp_sms.Send(gw.SMS)
    
        if(!this.Data._id) { this.Data._id = new ObjectID() }
        this.Data.Otp        = hash
        this.Data.State      = states.New
        await db.store.Save(this.Data)
    
        const user  = await db.user.Get(this.Data.AdminID, query.ByID)
        if (!user) Err_(code.BAD_REQUEST, reason.AdminNotFound)
        user.StoreList.Owned.push(String(this.Data._id))
        await db.user.Save(user)
        console.log('new-store-created', {Store: this.Data})
        return this.Data._id
    }
    
    this.ConfirmMobileNo   = async function(data)
    {
        const key = { AdminID: data.User._id, MobileNo : data.MobileNo }
        this.Data = await db.store.Get(key, query.Custom)
        if (!this.Data || this.Data.State === states.Registered)
        {
            let reason_ = (this.Data) ? reason.BadState : reason.StoreNotFound
            Err_(code.BAD_REQUEST, reason_)
        }
        const otp_       = new otp.OneTimePasswd({MobileNo: '', Body: ''})
            , otp_status = await otp_.Confirm(this.Data.Otp, data.OTP)
        if (!otp_status) Err_(code.BAD_REQUEST, reason.OtpRejected)
    
        this.Data.State  = states.MobConfirmed
        this.Data.Otp  = ''
        await db.store.Save(this.Data)
        console.log('store-mobile-number-confirmed', {Store: this.Data})
        // TODO Send an event to Admin
    }
    
    this.SetPayoutGW    = async function(data)
    {
        // Create cutomer
        // Create Account
    }

    this.Approve   = async function (data)
    {
        console.log('store-approval', {Store: data})

        const admin = await db.user.Get(data.User._id, query.ByID)
        if (!admin || admin.Mode !== mode.Admin)
        Err_(code.BAD_REQUEST, reason.PermissionDenied)
    
        this.Data = await db.store.Get(data.StoreID, query.ByID)
        if (!this.Data || this.Data.State !== states.MobConfirmed)
        {
                    let reason_ = reason.StoreNotFound
            if(this.Data) reason_ = reason.BadState
            Err_(code.BAD_REQUEST, reason_)
        }
        this.Data.State      = states.Registered
        await db.store.Save(this.Data)
        console.log('store-approved', {Store: this.Data})
    }
    
    this.ListStores  = async function (user)
    {
        console.log('list-store', {User : user})
        let data = { Owned : [], Accepted : [], Pending  : [] }
        let proj =
        {   _id   : 1, Name  : 1, Type : 1
          , Image : 1, State : 1           }
        let stores    = user.StoreList
        data.Owned    = await db.store.GetMany(stores.Owned    , proj)
        delete proj.State
        data.Accepted = await db.store.GetMany(stores.Accepted , proj)
        data.Pending  = await db.store.GetMany(stores.Pending  , proj)
        console.log('store-list', {Store: data})
        return data
    }    
}

module.exports =
{
    Store: Store
}