const { ObjectID }           = require('mongodb')
    , otp                    = require('../../infra/otp')
    , { Err_, code, reason, limits
      , states, mode, qtype, command
      , query, message, gw } = require('../../system/models')
    , db                     = 
    {
          store   : require('../store/archive')
        , user    : require('../user/archive')
        , journal : require('../journal/archive')
        , product : require('../product/archive')
    }
    , jwt                    = require('../../infra/jwt')

function Store(data)
{
    if (data)
    this.Data             =
    {
          _id             : ''
        , Email           : ''
        , Image           : ''
        , Certs           : []
        , Type            : ''

        , Name            : ''
        , Description     : ''
        , MobileNo        : data.MobileNo
        , SockID          : []
        , Location        :
        {
              type        : 'Point'
            , coordinates : [0, 88] // [data.Longitude.loc(), data.Latitude.loc()]
        }
        , Address         :
        {
              Line1       : ''
            , Line2       : ''
            , City        : ''
            , PostalCode  : ''
            , State       : ''
            , Country     : ''
        }
        , State           : states.New
        , Time            :
        {
            Open          : { Hour: '', Minute: '' }
          , Close         : { Hour: '', Minute: '' }
        }
        , IsLive          : false
        , Status          :
        {
              Current     : states.Closed
            , SetOn       : 
            {
                  Minute  : (new Date(0)).getMinutes()
                , Hour    : (new Date(0)).getHours()
                , Day     : (new Date(0)).getDate()
                , Month   : (new Date(0)).getMonth()
                , Year    : (new Date(0)).getFullYear()
            }
        }
    }

    this.Read = async function(in_)
    {
        console.log('read-store', { In: in_ })
        let data, now_
        switch(in_.Mode)
        {
          case mode.Store:
          case mode.AdminID:
            data =
            {
                StoreID     : in_.Store._id
              , Email       : in_.Store.Email
              , State       : in_.Store.State
              , Image       : in_.Store.Image
              , Certs       : in_.Store.Certs
              , Description : in_.Store.Description
              , Type        : in_.Store.Type
              , Name        : in_.Store.Name
              , MobileNo    : in_.Store.MobileNo
              , Longitude   : in_.Store.Location.coordinates[0].toFixed(5).toString()
              , Latitude    : in_.Store.Location.coordinates[1].toFixed(5).toString()
              , Address     : in_.Store.Address
              , Time        : in_.Store.Time
            }
            
            now_               = new Date()        
            if(now_.is_now(in_.Store.Time.Open, in_.Store.Time.Close))
            {
                if(!now_.is_today(in_.Store.Status.SetOn)) 
                { data.Status = states.Closed            }
                else
                { data.Status = in_.Store.Status.Current }
            }
            else { data.Status = states.Closed }

            break
          case mode.User:

            this.Data = await db.store.Get(in_.ID, query.ByID)
            if (!this.Data) Err_(code.BAD_REQUEST, reason.StoreNotFound)
            
            if (this.Data.State !== states.Registered)
            Err_(code.FORBIDDEN, reason.PermissionDenied)
            data =
            {
                StoreID     : this.Data._id
              , Name        : this.Data.Name
              , Image       : this.Data.Image
              , Description : this.Data.Description              
              , Certs       : this.Data.Certs
              , Type        : this.Data.Type
              , Address     : this.Data.Address
              , Time        : this.Data.Time
            }
            now_               = new Date()        
            if(now_.is_now(this.Data.Time.Open, this.Data.Time.Close))
            {
                if(!now_.is_today(this.Data.Status.SetOn) ||
                    now_.diff_in_m(this.Data.Time.Close)  < limits.CheckoutGracePeriod) 
                { data.Status = states.Closed            }
                else
                { data.Status = this.Data.Status.Current }
            }
            else { data.Status = states.Closed }
            
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
        const store_ = await db.store.Get(key2, query.Custom)
        if (store_ && store_.State === states.Registered)
        {
            const otp_sms = new otp.OneTimePasswd({
                            MobileNo: store_.MobileNo, 
                            Body: 	  message.OnAuth })
                , hash    = await otp_sms.Send(gw.SMS)

            store_.Otp = hash
            await db.store.Save(store_)
            return
        }
    
        const otp_sms = new otp.OneTimePasswd({
                        MobileNo: 	this.Data.MobileNo, 
                        Body: 	message.OnAuth })
            , hash    = await otp_sms.Send(gw.SMS)

        if(!store_) { this.Data._id = new ObjectID() }
        else { this.Data._id = store_._id }

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
        if (!this.Data) Err_(code.BAD_REQUEST, reason.StoreNotFound)

        const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
            , status = await otp_.Confirm(this.Data.Otp, data.OTP)

        if (!status) Err_(code.BAD_REQUEST, reason.OtpRejected)

        const token = await jwt.Sign({ _id : this.Data._id, Mode : mode.Store })

        if (this.Data.State === states.Registered)
        {
            console.log('user-exists-logging-in', { User: this.Data })            
            return {
                  Token: token
                , Command: command.LoggedIn
            }
        }
        this.Data.State = states.MobConfirmed
        this.Data.Otp   = ''
        await db.store.Save(this.Data)
        console.log('user-mobile-number-confirmed', { User: this.Data })

        return {
            Token: token
          , Command: command.Register
        }
    }

    this.Register   = async function (data)
    {
        if (data.Store.State !== states.MobConfirmed)
        Err_(code.BAD_REQUEST, reason.MobileNoNotConfirmed)

        data.Store.Email       = data.Email
        data.Store.Image       = data.Image
        data.Store.Certs       = data.Certs
        data.Store.Type        = data.Type
        data.Store.Name        = data.Name
        data.Store.Description = data.Description
        data.Store.MobileNo    = data.MobileNo
        data.Store.SockID      = []
        data.Store.Location    =
        {
              type        : 'Point'
            , coordinates : [data.Longitude.loc(), data.Latitude.loc()]
        }
        data.Store.Address     =
        {
              Line1       : data.Address.Line1
            , Line2       : data.Address.Line2
            , City        : data.Address.City
            , PostalCode  : data.Address.PostalCode
            , State       : data.Address.State
            , Country     : data.Address.Country
        }
        data.Store.Time        =
        {
            Open          : { Hour: data.Time.Open.Hour,  Minute: data.Time.Open.Minute  }
          , Close         : { Hour: data.Time.Close.Hour, Minute: data.Time.Close.Minute }
        }      
        data.Store.State  = states.ToBeApproved

        await db.store.Save(data.Store)
        console.log('store-scheduled-for-approval', { Store  : data.Store })
    }

    this.Approve   = async function (data)
    {
        console.log('store-approval', {Store: data})

        this.Data = await db.store.Get(data.StoreID, query.ByID)
        if (!this.Data || this.Data.State !== states.ToBeApproved)
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
            proj    = { projection: { _id   : 1, Name  : 1, Type : 1, Image : 1, Status: 1, Time: 1, Description: 1 } }
            in_.Query = { Location: { $geoWithin: { $center: [ [ in_.Latitude.loc(), in_.Longitude.loc()], 2500 ] } } } 

            if(in_.Category) in_.Query.Type     = in_.Category
            if(in_.Text)     in_.Query['$text'] = { $search: in_.Text }

            data = await db.store.List(in_, proj)
            for(let idx = 0; idx < data.length; idx++)
            {
                data[idx].StoreID = data[idx]._id
                delete data[idx]._id    

                let now_               = new Date()        
                if(now_.is_now(data[idx].Time.Open, data[idx].Time.Close))
                {
                    if(!now_.is_today(data[idx].Status.SetOn)) 
                    { data[idx].Status = states.Closed            }
                    else
                    { data[idx].Status = data[idx].Status.Current /* No action: set state as set by seller */ }
                }
                else { data[idx].Status = states.Closed }
            }
            break
          case mode.Admin:
            proj =
            { _id   : 1, Name  : 1, Type : 1
            , Image : 1, State : 1, Status: 1, Time: 1, Description: 1 }
            switch(in_.Type)
            {
                case qtype.NearList:
                in_.Query = { Location: { $geoWithin: { $center: [ [ in_.Latitude.loc(), in_.Longitude.loc()], 2500 ] } } } 

                // TODO check unit of radius 2500

                if(in_.Category) in_.Query.Type     = in_.Category
                if(in_.Text)     in_.Query['$text'] = { $search: in_.Text }

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
                
            let now_               = new Date()        
            if(now_.is_now(data[idx].Time.Open, data[idx].Time.Close))
            {
                if(!now_.is_today(data[idx].Status.SetOn)) 
                { data[idx].Status = states.Closed            }
                else
                { data[idx].Status = data[idx].Status.Current /* No action: set state as set by seller */ }
            }
            else { data[idx].Status = states.Closed }
            
            break
        }
        console.log('store-list', { Stores : data, Mode: mode_ })
        return data
    }

    this.Edit   = async function (data)
    {
        console.log('edit-store', { Input : data})

        let rcd = { _id : data.Store._id }
        if(data.Email)       rcd.Email       = data.Email
        if(data.Image)       rcd.Image       = data.Image
        if(data.Certs)       rcd.Certs       = data.Certs
        if(data.Type)        rcd.Type        = data.Type
        if(data.Name)        rcd.Name        = data.Name
        if(data.Description) rcd.Description = data.Description        
        if(data.Longitude && data.Latitude)  
                          rcd.Location = 
                          { 
                                type        : 'Point'
                              , coordinates : [ data.Longitude.loc(), data.Latitude.loc() ]
                          }
        if(data.Address)  rcd.Address  = data.Address
        if(data.Status)
        {
            let now_ = new Date()
            rcd.Status = 
            {
                  Current     : data.Status
                , SetOn       :
                {
                    Minute    : now_.getMinutes()
                  , Hour      : now_.getHours()
                  , Day       : now_.getDate()
                  , Month     : now_.getMonth()
                  , Year      : now_.getFullYear()
                }
            }
        }
        if(data.Time)     rcd.Time     = data.Time
        if(rcd.Location)
        {
            const data_ = { Location: rcd.Location }
            await db.product.UpdateMany(rcd._id, data_)
        }
        // TODO MobileNo
        await db.store.Save(rcd)

        console.log('store-updated', { Record: rcd })
    }
    
}

module.exports =
{
    Store: Store
}