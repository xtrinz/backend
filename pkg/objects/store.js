const { User }                      = require("./user")
    , { ObjectID, ObjectId }        = require("mongodb")
    , { stores }                    = require("../common/database")
    , otp                           = require('../common/otp')
    , test                          = require('../common/test')
    , { Err_, code, reason}         = require('../common/error')
    , { states, mode, query, task } = require("../common/models")

function Store(data)
{
    if (data)
    this.Data             =
    {
          _id             : ''
        , AdminID         : ObjectId(data.User._id)
        , Name            : data.Name
        , Image           : data.Image
        , Type            : data.Type
        , Certs           : data.Certs
        , MobileNo        : data.MobileNo
        , Email           : data.Email
        , Location        :
        {
              type        : 'Point'
            , coordinates : [data.Longitude, data.Latitude]
        }
        , State           : states.New
        , StaffList       :
        {
              Approved    : []
            , Pending     : []
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
    }

    this.Save       = async function()
    {
        console.log('save-store', this.Data)
        const query = { _id    : this.Data._id }
            , act   = { $set   : this.Data }
            , opt   = { upsert : true }
        const resp  = await stores.updateOne(query, act, opt)
        if (!resp.result.ok)
        {
            console.log('store-save-failed',
            { Data: this.Data, Result: resp.result })
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
        }
        console.log('store-saved', this.Data)
    }

    this.Get = async function(param, qType)
    {
        console.log('find-store', { Param: param, QType: qType})
        let query_
        switch (qType)
        {
            case query.ByID   : query_ = { _id: ObjectId(param) } ; break;
            case query.Custom : query_ = param                    ; break;
        }
        let store = await stores.findOne(query_)
        if (!store)
        {
          console.log('store-not-found', query_)
          return
        }
        this.Data = store
        console.log('store-found', { Sotre: store })
        return store
    }

    this.CustomQuery = async function(key)
    {
        console.log('find-store', key)
        let store = await stores.find(key)
        if (!store)
        {
          console.log('store-does-not-exist', {Query: key})
          return false
        }
        console.log('store-exist',  {Store: store})
        return true
    }

    this.Read = async function(store_id, user_id)
    {
        console.log('read-store', {Store: store_id, UserID: user_id})
        const store = await this.Get(store_id, query.ByID)
        if (!store) Err_(code.BAD_REQUEST, reason.StoreNotFound)
        let data = { ...this.Data }
        if (store.AdminID !== user_id)
        {
            if (data.State !== states.Registered)
            Err_(code.FORBIDDEN, reason.PermissionDenied)
            delete data.State
        }
        delete data.StaffList
        delete data.Otp
        delete data.AdminID
        delete data._id
        data.StoreID = store_id
        let loc = data.Location
        delete data.Location
        data.Latitude  = loc.coordinates[1]
        data.Longitude = loc.coordinates[0]
        console.log('store-read', data)
        return data
    }

    this.ListNearby = async function(PageNo, Lon, Lat)
    {
        const   nPerPage = 30
              , skip     = PageNo > 0 ? (PageNo - 1)*nPerPage : 0;
        const query      = 
        { Location: { $near: { $geometry: 
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
        // Check admin have shop with same name
        const key1 = { AdminID  : this.Data.AdminID, Name : this.Data.Name }
            , res1 = await this.Get(key1, query.Custom)
        if (res1 && res1.State === states.Registered)
        Err_(code.BAD_REQUEST, reason.StoreExists)

        // Check the mobile number already used
        const key2 = { MobileNo : this.Data.MobileNo }
            , res2 = await this.Get(key2, query.Custom)
        if (res2 && res1.State === states.Registered)
        Err_(code.BAD_REQUEST, reason.Unauthorized)

        const otp_sms = new otp.OneTimePasswd({
                        MobNo: 	this.Data.MobileNo, 
                        Body: 	otp.Msgs.OnAuth })
            , hash    = await otp_sms.Send(otp.Opts.SMS)

        if(!this.Data._id) { this.Data._id = new ObjectID() }
        this.Data.Otp        = hash
        this.Data.State      = states.New
        await this.Save()

        test.Set('StoreID', this.Data._id) // #101
        test.Set('AdminID', this.Data.AdminID) // #101

        const user = new User()
        const resp = await user.Get(this.Data.AdminID, query.ByID)
        if (!resp) Err_(code.BAD_REQUEST, reason.AdminNotFound)
        user.Data.StoreList.Owned.push(String(this.Data._id))
        await user.Save()
        console.log('new-store-created', {Store: this.Data})
    }

    this.ConfirmMobNo   = async function(data)
    {
        const key = { AdminID: ObjectId(data.User._id), MobileNo : data.MobileNo }
        let store = await this.Get(key, query.Custom)
        if (!store || store.State === states.Registered)
        {
            let reason_ = reason.StoreNotFound
            if(store) { reason_ = reason.BadState}
            Err_(code.BAD_REQUEST, reason_)
        }

        const otp_       = new otp.OneTimePasswd({MobNo: "", Body: ""})
            , otp_status = await otp_.Confirm(this.Data.Otp, data.OTP)
        if (!otp_status) Err_(code.BAD_REQUEST, reason.OtpRejected)

        this.Data.State  = states.MobConfirmed
        this.Data.Otp  = ''
        await this.Save()
        console.log('store-mobile-number-confirmed', {Store: this.Data})
        // TODO Send an event to Admin
    }

    this.Approve   = async function (data)
    {
        console.log('store-approval', {Store: data})
        const user  = new User()
        const admin = await user.Get(data.User._id, query.ByID)
        if (!admin || admin.Mode !== mode.Admin)
        Err_(code.BAD_REQUEST, reason.PermissionDenied)

        const store = await this.Get(data.StoreID, query.ByID)
        if (!store || store.State !== states.MobConfirmed)
        {
                  let reason_ = reason.StoreNotFound
            if(store) reason_ = reason.BadState
            Err_(code.BAD_REQUEST, reason_)
        }

        this.Data.State      = states.Registered
        await this.Save()
        console.log('store-approved', {Store: this.Data})
    }

    this.AddStaff   = async function (data)
    {
        console.log('add-staff', { In: data})
        const key   = { _id: ObjectId(data.StoreID), AdminID: ObjectId(data.User._id) }
        const store = await this.Get(key, query.Custom)
        if (!store || store.State !== states.Registered)
        {
            let     reason_   = reason.StoreNotFound
            if(store) reason_ = reason.UnapprovedSotre
            Err_(code.BAD_REQUEST, reason_)
        }

        const staff_ = new User()
        const staff  = await staff_.Get(data.MobileNo, query.ByMobNo)
        if (!staff) Err_(code.BAD_REQUEST, reason.StaffNotFound)
        if (staff.StoreList.Accepted.includes(String(store._id)) ||
            this.Data.StaffList.Approved.includes(String(staff._id)) )
            Err_( code.BAD_REQUEST, reason.StaffExists)

        staff_.Data.StoreList.Pending.push(String(store._id))
        await staff_.Save()
        this.Data.StaffList.Pending.push(String(staff._id))
        await this.Save()

        console.log('staff-invitation-send', {Store: this.Data})
    }

    this.SetStaffReplay   = async function (data)
    {
        console.log('set-staff-replay', {In: data})
        const store = await this.Get(data.StoreID, query.ByID)
        if (!store || store.State !== states.Registered)
        {
            let     reason_   = reason.StoreNotFound
            if(store) reason_ = reason.UnapprovedSotre
            Err_(code.BAD_REQUEST, reason_)
        }
        const staff_ = new User()
        const staff  = await staff_.Get(data.User._id, query.ByID)
        if (!staff) Err_(code.BAD_REQUEST, reason.StaffNotFound)

        if( !staff_.Data.StoreList.Pending.includes(String(store._id)) ||
            !this.Data.StaffList.Pending.includes(String(staff._id)) )
            Err_(code.BAD_REQUEST, reason.NoContextFound)

        staff_.Data.StoreList.Pending.pop(String(store._id))
        this.Data.StaffList.Pending.pop(String(staff._id))

        if (data.Task == task.Accept)
        {
          staff_.Data.StoreList.Accepted.push(String(store._id))
          this.Data.StaffList.Approved.push(String(staff._id))
        }

        await staff_.Save()
        await this.Save()
        console.log('staff-response-set', {Store: this.Data, Staff: staff})
    }

    this.RelieveStaff   = async function (data)
    {
        console.log('relieve-staff', {In: data})
        const key   = { _id: ObjectId(data.StoreID), AdminID: ObjectId(data.User._id) }
        const store = await this.Get(key, query.Custom)
        if (!store || store.State !== states.Registered)
        {
            let     reason_   = reason.StoreNotFound
            if(store) reason_ = reason.UnapprovedSotre
            Err_(code.BAD_REQUEST, reason_)
        }

        const staff_  = new User()
        const staff   = await staff_.Get(data.StaffID, query.ByID)
        if (!staff) Err_( code.BAD_REQUEST, reason.StaffNotFound)

        if( !staff_.Data.StoreList.Accepted.includes(String(store._id)) ||
            !this.Data.StaffList.Approved.includes(String(staff._id)) )
            Err_(code.BAD_REQUEST, reason.NoContextFound)

        staff_.Data.StoreList.Accepted.pop(String(store._id))
        this.Data.StaffList.Approved.pop(String(staff._id))

        await staff_.Save()
        await this.Save()
        console.log('staff-relieved', { Store: this.Data, Staff: staff})
    }

    this.RevokeStaffReq   = async function (data)
    {
        console.log('revoke-staff', { In: data})
        const key   = { _id: ObjectId(data.StoreID), AdminID: ObjectId(data.User._id) }
        const store = await this.Get(key, query.Custom)
        if (!store || store.State !== states.Registered)
        {
            let     reason_     = reason.StoreNotFound
            if(store) { reason_ = reason.UnapprovedSotre}
            Err_(code.BAD_REQUEST, reason_)
        }

        const staff_  = new User()
        const staff   = await staff_.Get(data.StaffID, query.ByID)
        if (!staff) Err_(code.BAD_REQUEST, reason.StaffNotFound )

        if( !staff_.Data.StoreList.Pending.includes(String(store._id)) ||
            !this.Data.StaffList.Pending.includes(String(staff._id)) )
            Err_(code.BAD_REQUEST, reason.NoContextFound)
        
        staff_.Data.StoreList.Pending.pop(String(store._id))
        this.Data.StaffList.Pending.pop(String(staff._id))

        await staff_.Save()
        await this.Save()
        console.log('staff-revoked', {Store: this.Data, Staff: staff_.Data})
    }

    this.ListStaff  = async function (in_)
    {
        console.log(`list-staff. in: ${in_}`)
        const key   = { _id: ObjectId(in_.StoreID), AdminID: ObjectId(in_.UserID) }
        const store = await this.Get(key, query.Custom)
        if (!store || store.State !== states.Registered)
        {
            let     reason_      = reason.StoreNotFound
            if(store) { reason_ = reason.UnapprovedSotre}
            Err_(code.BAD_REQUEST, status_, reason_)
        }

        const staff_  = new User()
        let data =
        {
          Approved   : [],
          Pending    : []
        }
        const ReadUser = (id) =>
        {
          const staff   = staff_.Get(id, query.ByID)
          if (!staff) Err_(code.BAD_REQUEST , reason.StaffNotFound)
          const res =
          {
              StaffID: staff._id
            , Name   : staff.Name
          }
          return res
        }
        this.StaffList.Approved.forEach((id)=>
        {
          const out = ReadUser(id)
          data.Approved.push(out)
        })

        this.StaffList.Pending.forEach((id)=>
        {
          const out = ReadUser(id)
          data.Pending.push(out)
        })

        console.log(`staff-list. store: ${data}`)
        return data
    }

    this.ListStores  = async function (in_)
    {
        console.log('list-store', {in: in_})

        const user  = new User()
        const resp = await user.Get(in_.UserID, query.ByID)
        if (!resp) Err_(code.BAD_REQUEST, reason.StaffNotFound)
        
        let data =
        {
          Owned      : [],
          Accepted   : [],
          Pending    : []
        }

        const store_ = new Store()
        const ReadStore = async (id) =>
        {
          const store   = await store_.Get(id, query.ByID)
          if (!store) Err_(code.BAD_REQUEST, reason.StoreNotFound)

          const res =
          {
              StoreID: store._id
            , Name   : store.Name
            , Type   : store.Type
            , Image  : store.Image
            , State  : store.State
          }
          return res
        }

        let stores = user.Data.StoreList
        for(let i = 0; i < stores.Owned.length; i++)
        {
          const out = await ReadStore(stores.Owned[i])
          data.Owned.push(out)
        }

        for(let i = 0; i < stores.Accepted.length; i++)
        {
          const out = await ReadStore(stores.Accepted[i])
          delete out.State
          data.Accepted.push(out)
        }

        for(let i = 0; i < stores.Pending.length; i++)
        {
          const out = await ReadStore(stores.Pending[i])
          delete out.State
          data.Pending.push(out)
        }

        console.log('store-list', {Store: data})
        return data
    }
}

module.exports =
{
    Store: Store
}