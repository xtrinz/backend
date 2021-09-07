const { ObjectID }           = require('mongodb')
    , otp                    = require('../../infra/otp')
    , { Err_, code, reason}  = require('../../system/models')
    , { states, mode, qtype
      , query, message, gw } = require('../../system/models')
    , db                     = 
    {
          store   : require('../store/archive')
        , user    : require('../user/archive')
    }
    , jwt                    = require('../../infra/jwt')

function Store(data)
{
    if (data)
    this.Data             =
    {
          _id             : ''
        , Email           : data.Email
        , Image           : data.Image
        , Certs           : data.Certs
        , Type            : data.Type

        , Name            : data.Name
        , MobileNo        : data.MobileNo
        , SockID          : []
        , Location        :
        {
              type        : 'Point'
            , coordinates : [data.Longitude.loc(), data.Latitude.loc()]
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
    }

    this.Read = async function(in_)
    {
        console.log('read-store', { In: in_ })
        let data
        switch(in_.Mode)
        {
          case mode.Store:
          case mode.AdminID:
            data =
            {
                StoreID   : in_.Store._id
              , Email     : in_.Store.Email
              , State     : in_.Store.State
              , Image     : in_.Store.Image
              , Certs     : in_.Store.Certs
              , Type      : in_.Store.Type
              , Name      : in_.Store.Name
              , MobileNo  : in_.Store.MobileNo
              , Longitude : in_.Store.Location.coordinates[0]
              , Latitude  : in_.Store.Location.coordinates[1]
              , Address   : in_.Store.Address
            }
            break
          case mode.User:

            this.Data = await db.store.Get(in_.ID, query.ByID)
            if (!this.Data) Err_(code.BAD_REQUEST, reason.StoreNotFound)
            
            if (this.Data.State !== states.Registered)
            Err_(code.FORBIDDEN, reason.PermissionDenied)
            data =
            {
                StoreID   : this.Data._id
              , Name      : this.Data.Name
              , Image     : this.Data.Image
              , Certs     : this.Data.Certs
              , Type      : this.Data.Type
              , Address   : this.Data.Address
            }
            break
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
    
    this.Auth   = async function (token)
    {
        if (!token) Err_(code.BAD_REQUEST, reason.TokenMissing)

        token       = token.slice(7) // cut 'Bearer <token>'
        const res   = await jwt.Verify(token)
        if (!res || !res._id) Err_(code.BAD_REQUEST, reason.UserNotFound)

        if(res.Mode !== mode.Store)
        Err_(code.BAD_REQUEST, reason.InvalidToken)

        this.Data = await db.store.Get(res._id, query.ByID)
        if (!this.Data)
        {
            console.log('store-not-found', {UserID: res._id})
            Err_(code.BAD_REQUEST, reason.InvalidToken)
        }
        console.log('store-authenticated', {User: this.Data})
    }

    // Authz usr for product mgmt
    this.Authz      = async function(StoreID, UserID) 
    {
        this.Data = await db.store.Get(StoreID, query.ByID)
        if (!this.Data) Err_(code.BAD_REQUEST, reason.StoreNotFound)
    
        if(String(this.Data.AdminID) !== String(UserID))
            Err_(code.BAD_REQUEST, reason.Unauthorized)
    }
    
    this.New      = async function ()
    {    
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
        this.Data.MobileNo   = this.Data.MobileNo
        this.Data.Otp        = hash
        this.Data.State      = states.New
        await db.store.Save(this.Data)
    
        console.log('new-store-created', {Store: this.Data})
    }
    
    this.ConfirmMobileNo   = async function(data)
    {
        const key = { MobileNo : data.MobileNo }
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
        const token = await jwt.Sign({ _id: this.Data._id, Mode: mode.Store })
        return token        
    }

    this.Approve   = async function (data)
    {
        console.log('store-approval', {Store: data})

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
    
    this.List  = async function (in_, mode_)
    {
        console.log('list-store', { In : in_ })
        let data, proj
        switch(mode_)
        {
          case mode.User:
            proj    = { projection: { _id   : 1, Name  : 1, Type : 1, Image : 1 } }
            in_.Query   =
            { 
                Location: 
                { 
                    $near : { $geometry: 
                        { 
                              type          : 'Point'
                            , coordinates   : [ in_.Longitude.loc(), in_.Latitude.loc() ] 
                        } }
                } 
            }
            data = await db.store.List(in_, proj)
            for(let idx = 0; idx < data.length; idx++)
            {
                data[idx].StoreID = data[idx]._id
                delete data[idx]._id    
            }
            break
          case mode.Admin:
            proj =
            { _id   : 1, Name  : 1, Type : 1
            , Image : 1, State : 1           }
            switch(in_.Type)
            {
                case qtype.NearList:
                in_.Query = 
                { 
                    Location: 
                    { 
                        $near : { $geometry: 
                            { 
                                  type          : 'Point'
                                , coordinates   : [ in_.Longitude.loc(), in_.Latitude.loc() ] 
                            } }
                    } 
                }
                break
                case qtype.Pending:
                in_.Query = { State : states.MobConfirmed }
                break
                case qtype.NearPending:
                in_.Query = 
                { 
                    Location  :
                    { 
                        $near : { $geometry: 
                            { 
                                  type          : 'Point'
                                , coordinates   : [ in_.Longitude.loc(), in_.Latitude.loc() ] 
                            } } 
                    },
                    State     : states.MobConfirmed
                }
                break
            }
            data = await db.store.List(query_, proj)
            break
        }
        console.log('store-list', { Stores : data, Mode: mode_ })
        return data
    }

    this.Edit   = async function (data)
    {
        console.log('edit-store', { Input : data})

        let rcd = { _id : data.Store._id }
        if(data.Email)    rcd.Email    = data.Email
        if(data.Image)    rcd.Image    = data.Image
        if(data.Certs)    rcd.Certs    = data.Certs
        if(data.Type)     rcd.Type     = data.Type
        if(data.Name)     rcd.Name     = data.Name
        if(data.Longitude && data.Latitude)  
                          rcd.Location = 
                          { 
                                type        : 'Point'
                              , coordinates : [ data.Longitude.loc(), data.Latitude.loc() ]
                          }
        if(data.Address)  rcd.Address  = data.Address
        // TODO MobileNo
        await db.store.Save(rcd)

        console.log('store-updated', { Record: rcd })
    }
    
}

module.exports =
{
    Store: Store
}