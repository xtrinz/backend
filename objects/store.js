const { User }                      = require("./user")
    , { ObjectID, ObjectId }        = require("mongodb")
    , { stores }                    = require("../common/database")
    , otp                           = require('../common/otp')
    , { Err, code, status, reason}  = require('../common/error')
    , { states, mode }              = require("../common/models")

function Store(data)
{
    this._id                 = ''
    this.AdminID             = ObjectId(data.AdminID)
    this.Name                = data.Name
    this.Img                 = data.Image
    this.Type                = data.Type
    this.Certs               = data.Certs
    this.MobileNo            = data.MobileNo
    this.Email               = data.Email
    this.Location            =
    {
          type          : 'Point'
        , coordinates   : [data.Longitude, data.Latitude]
    }
    this.State               = states.New
    
    this.StaffList           =
    {
          Approved : []
        , Pending  : []
    }

    this.Address             =
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
        this.StaffList  = data.StaffList
    }

    this.Save       = async function()
    {
        console.log('save-store', this)
        const   query = { _id : this._id }
              , act   = { $set : this }
              , opt   = { upsert : true }
        const resp  = await users.updateOne(query, act, opt)
        if (resp.modifiedCount !== 1) 
        {
            console.log('save-store-failed', this)
            const   code_   = code.INTERNAL_SERVER
                  , status_ = status.Failed
                  , reason_ = reason.DBAdditionFailed
            throw new Err(code_, status_, reason_)
        }
    }

    this.GetByID = function(_id)
    {
        console.log(`find-store-by-id. ID: ${_id}`)
        const query = { _id: ObjectId(_id) }
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

    this.GetByAdminIDAndStoreID = function(admin_id, shop_id)
    {
        console.log(`store-by-admin-and-shop-id. admin_id: ${admin_id} shop_id: ${shop_id}`)
        const query = { _id: ObjectId(shop_id), AdminID: ObjectId(admin_id) }
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

        const user  = new User()
        const resp = user.GetByID(data.UserID)
        if (!resp)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.StaffNotFound
            throw new Err(code_, status_, reason_)
        }
        user.StoreList.Owned.push(this._id)
        user.Save()

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

        const store = await this.GetByID(ObjectId(data.StoreID))
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

    this.AddStaff   = async function (data)
    {
        console.log(`add-staff. in: ${data}`)
        const store = await this.GetByAdminIDAndStoreID(ObjectId(data.UserID), 
                                                       ObjectId(data.StoreID))
        if (!store || store.State !== states.Registered)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
            let     reason_     = reason.StoreNotFound
            if(!store) { reason_ = reason.UnapprovedSotre}
            throw new Err(code_, status_, reason_)
        }
        const staff_  = new User()
        const staff = staff_.GetByMobNo(ObjectId(data.MobileNo))
        if (!staff)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.StaffNotFound
            throw new Err(code_, status_, reason_)
        }

        if( staff.StoreList.Accepted.includes(store._id) ||
            this.StaffList.Approved.includes(staff._id) )
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.StaffExists
            throw new Err(code_, status_, reason_)
        }

        staff.StoreList.Pending.push(store._id)
        staff.Save()

        this.StaffList.Pending.push(staff._id)
        this.Save()
        
        console.log(`staff-invitation-send. store: ${this}`)
    }

    this.SetStaffReplay   = async function (data)
    {
        console.log(`set-staff-replay. in: ${data}`)
        const store = await this.GetByID(ObjectId(data.StoreID))
        if (!store || store.State !== states.Registered)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
            let     reason_     = reason.StoreNotFound
            if(!store) { reason_ = reason.UnapprovedSotre}
            throw new Err(code_, status_, reason_)
        }
        const staff_  = new User()
        const staff = staff_.GetByID(data.UserID)
        if (!staff)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.StaffNotFound
            throw new Err(code_, status_, reason_)
        }

        if( !staff.StoreList.Pending.includes(store._id) ||
            !this.StaffList.Pending.includes(staff._id) )
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.NoContextFound
            throw new Err(code_, status_, reason_)
        }

        staff.StoreList.Pending.pop(store._id)
        this.StaffList.Pending.pop(staff._id)

        if (data.Task == task.Accept)
        {
          staff.StoreList.Accepted.push(store._id)
          this.StaffList.Approved.push(staff._id)
        }

        staff.Save()
        this.Save()
        console.log(`staff-response-set. store: ${this} staff: ${staff}`)
    }

    this.RelieveStaff   = async function (data)
    {
        console.log(`relieve-staff. in: ${data}`)

        const store = await this.GetByAdminIDAndStoreID(data.UserID, data.StoreID)
        if (!store || store.State !== states.Registered)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
            let     reason_     = reason.StoreNotFound
            if(!store) { reason_ = reason.UnapprovedSotre}
            throw new Err(code_, status_, reason_)
        }

        const staff_  = new User()
        const staff   = staff_.GetByID(data.StaffID)
        if (!staff)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.StaffNotFound
            throw new Err(code_, status_, reason_)
        }

        if( !staff.StoreList.Accepted.includes(store._id) ||
            !this.StaffList.Approved.includes(staff._id) )
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.NoContextFound
            throw new Err(code_, status_, reason_)
        }

        staff.StoreList.Accepted.pop(store._id)
        this.StaffList.Approved.pop(staff._id)

        staff.Save()
        this.Save()
        console.log(`staff-relieved. store: ${this} staff: ${staff}`)
    }

    this.RevokeStaffReq   = async function (data)
    {
        console.log(`revoke-staff. in: ${data}`)

        const store = await this.GetByAdminIDAndStoreID(data.UserID, data.StoreID)
        if (!store || store.State !== states.Registered)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
            let     reason_     = reason.StoreNotFound
            if(!store) { reason_ = reason.UnapprovedSotre}
            throw new Err(code_, status_, reason_)
        }

        const staff_  = new User()
        const staff   = staff_.GetByID(data.StaffID)
        if (!staff)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.StaffNotFound
            throw new Err(code_, status_, reason_)
        }

        if( !staff.StoreList.Pending.includes(store._id) ||
            !this.StaffList.Pending.includes(staff._id) )
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.NoContextFound
            throw new Err(code_, status_, reason_)
        }
        
        staff.StoreList.Pending.pop(store._id)
        this.StaffList.Pending.pop(staff._id)

        staff.Save()
        this.Save()
        console.log(`staff-revoked. store: ${this} staff: ${staff}`)
    }

    this.ListStaff  = async function (data)
    {
        console.log(`list-staff. in: ${data}`)

        const store = await this.GetByAdminIDAndStoreID(data.UserID, data.StoreID)
        if (!store || store.State !== states.Registered)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
            let     reason_     = reason.StoreNotFound
            if(!store) { reason_ = reason.UnapprovedSotre}
            throw new Err(code_, status_, reason_)
        }

        const staff_  = new User()
        let data =
        {
          Approved   : [],
          Pending    : []
        }
        const ReadUser = (id) =>
        {
          const staff   = staff_.GetByID(id)
          if (!staff)
          {
              const   code_       = code.BAD_REQUEST
                    , status_     = status.Failed
                    , reason_     = reason.StaffNotFound
              throw new Err(code_, status_, reason_)
          }
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

    this.ListStores  = async function (data)
    {
        console.log(`list-store. in: ${data}`)

        const user  = new User()
        const resp = user.GetByID(data.UserID)
        if (!resp)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.StaffNotFound
            throw new Err(code_, status_, reason_)
        }
        
        let data =
        {
          Owned      : [],
          Approved   : [],
          Pending    : []
        }

        const store_ = new Store()
        const ReadStore = (id) =>
        {
          const store   = store_.GetByID(id)
          if (!store)
          {
              const   code_       = code.BAD_REQUEST
                    , status_     = status.Failed
                    , reason_     = reason.StoreNotFound
              throw new Err(code_, status_, reason_)
          }
          const res =
          {
              StoreID: store._id
            , Name   : store.Name
          }
          return res
        }

        user.StoreList.Owned.forEach((id)=>
        {
          const out = ReadStore(id)
          data.Owned.push(out)
        })

        user.StoreList.Accepted.forEach((id)=>
        {
          const out = ReadStore(id)
          data.Approved.push(out)
        })

        user.StoreList.Pending.forEach((id)=>
        {
          const out = ReadStore(id)
          data.Pending.push(out)
        })

        console.log(`store-list. store: ${data}`)
        return data
    }
}

module.exports =
{
    Store: Store
}