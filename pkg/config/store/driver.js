const { ObjectID } = require('mongodb')
    , otp          = require('../../infra/otp')
    , { Err_ }     = require('../../system/models')
    , Model        = require('../../system/models')
    , db           = require('../exports')[Model.segment.db]
    , jwt          = require('../../infra/jwt')
    , project      = require('../../tools/project/store')
    , rinse        = require('../../tools/rinse/store')
class Store
{
    constructor (data)
    {

        let init_ = new Date(0)
        let date_ =
        {
            Minute  : init_.getMinutes()
          , Hour    : init_.getHours()
          , Day     : init_.getDate()
          , Month   : init_.getMonth()
          , Year    : init_.getFullYear()
        }

        this._id          = new ObjectID()
        this.Email        = ''
        this.Image        = ''
        this.Certs        = []
        this.Type         = ''
        this.Name         = ''
        this.Description  = ''
        this.MobileNo     = data.MobileNo
        this.SockID       = []
        this.Address      =
        {
            Location      :
            {
                  type        : 'Point'
                , coordinates : [0, 88]
            }
            , Line1       : ''
            , Line2       : ''
            , City        : ''
            , PostalCode  : ''
            , State       : ''
            , Country     : ''
        }
        this.State        = Model.states.New
        this.Time         =
        {
            Open          : { Hour: '', Minute: '' }
          , Close         : { Hour: '', Minute: '' }
        }
        this.IsLive       = false
        this.Status       =
        {
              Current     : Model.states.Closed
            , SetOn       : date_
        }
    }

    async New()
    {    
        // Check the mobile number already used
        const key2 = { MobileNo : this.MobileNo }
        const store_ = await db.store.Get(key2, Model.query.Custom)
        if (store_ && ( store_.State === Model.states.Registered   ||
                        store_.State === Model.states.ToBeApproved ))
        {
            const otp_sms = new otp.OneTimePasswd({
                            MobileNo: store_.MobileNo, 
                            Body: 	  Model.message.OnAuth })
                , hash    = await otp_sms.Send(Model.gw.SMS)

            store_.Otp = hash
            await db.store.Save(store_)
            return
        }
    
        const otp_sms = new otp.OneTimePasswd({
                        MobileNo: 	this.MobileNo, 
                        Body: 	Model.message.OnAuth })
            , hash    = await otp_sms.Send(Model.gw.SMS)

        if(!store_) { this._id = new ObjectID() }
        else { this._id = store_._id }

        this.MobileNo   = this.MobileNo
        this.Otp        = hash
        this.State      = Model.states.New
        await db.store.Save(this)
    
        console.log('new-store-created', {Store: this})
    }
    
    static async ConfirmMobileNo(data)
    {
        const key = { MobileNo : data.MobileNo }
        let store_ = await db.store.Get(key, Model.query.Custom)
        if (!store_) Err_(Model.code.BAD_REQUEST, Model.reason.StoreNotFound)

        const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
            , status = await otp_.Confirm(store_.Otp, data.OTP)

        if (!status) 
        {
            console.log('wrong-otp-on-store-no-confirmation', { Data: data })            
            Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
        }

        const token = await jwt.Sign({ _id : store_._id, Mode : Model.mode.Store })

        if (store_.State === Model.states.Registered    ||
            store_.State === Model.states.ToBeApproved  ||
            store_.State === Model.states.ToBeCorrected )
        {
            console.log('user-exists-logging-in', { User: store_ })            
            return {
                  Token: token
                , Command: Model.command.LoggedIn
                , Store: store_
            }
        }
        store_.State = Model.states.MobConfirmed
        store_.Otp   = ''
        await db.store.Save(store_)
        console.log('user-mobile-number-confirmed', { User: store_ })

        return {
            Token: token
          , Command: Model.command.Register
          , Store: store_          
        }
    }

    static async Register(data)
    {
        if (data.Store.State !== Model.states.MobConfirmed)
        Err_(Model.code.BAD_REQUEST, Model.reason.MobileNoNotConfirmed)

        data.Store.Email       = data.Email
        data.Store.Image       = data.Image
        data.Store.Certs       = data.Certs
        data.Store.Type        = data.Type
        data.Store.Name        = data.Name
        data.Store.Description = data.Description
        data.Store.MobileNo    = data.MobileNo
        data.Store.SockID      = []
        data.Store.Address     =
        {
              Line1       : data.Address.Line1
            , Line2       : data.Address.Line2
            , City        : data.Address.City
            , Location    :
            {
                  type        : 'Point'
                , coordinates : [data.Address.Longitude.loc(), data.Address.Latitude.loc()]
            }
            , PostalCode  : data.Address.PostalCode
            , State       : data.Address.State
            , Country     : data.Address.Country
        }
        data.Store.Time        =
        {
            Open          : { Hour: data.Time.Open.Hour,  Minute: data.Time.Open.Minute  }
          , Close         : { Hour: data.Time.Close.Hour, Minute: data.Time.Close.Minute }
        }      
        data.Store.State  = Model.states.ToBeApproved

        await db.store.Save(data.Store)
        console.log('store-scheduled-for-approval', { Store  : data.Store })
    }

    static async Approve(data)
    {
        console.log('store-approval', {Store: data})

        let store_ = await db.store.Get(data.StoreID, Model.query.ByID)
        if (!store_ || store_.State !== Model.states.ToBeApproved)
        {
                   let reason_ = Model.reason.StoreNotFound
            if(store_) reason_ = Model.reason.BadState
            Err_(Model.code.BAD_REQUEST, reason_)
        }

        if(data.Action == Model.task.Deny)
        {
            store_.State  = Model.states.ToBeCorrected
            store_.Text   = data.Text
        }
        else
        {
            store_.State  = Model.states.Registered
            store_.Text   = ''
        }

        await db.store.Save(store_)
        console.log('store-admin-response-marked', { Store: store_ })
    }

    static async Read(in_)
    {
        console.log('read-store', { In: in_ })
        let data, store_
        switch(in_.Mode)
        {
          case Model.mode.Store:
          case Model.mode.Admin:
            store_ = in_.Store
            data =
            {
                StoreID     : store_._id
              , Email       : store_.Email
              , State       : store_.State
              , Image       : store_.Image
              , Certs       : store_.Certs
              , Description : store_.Description
              , Type        : store_.Type
              , Name        : store_.Name
              , MobileNo    : store_.MobileNo
              , Address     : store_.Address
              , Time        : store_.Time
            }

            break
          case Model.mode.User:

            store_ = await db.store.Get(in_.ID, Model.query.ByID)
            if (!store_) Err_(Model.code.BAD_REQUEST, Model.reason.StoreNotFound)
            
            if (store_.State !== Model.states.Registered)
            Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
            data =
            {
                StoreID     : store_._id
              , Name        : store_.Name
              , Image       : store_.Image
              , Description : store_.Description              
              , Certs       : store_.Certs
              , Type        : store_.Type
              , Address     : store_.Address
              , Time        : store_.Time
            }
            
            break
        }

        rinse[Model.verb.view][in_.Mode](data, store_)

        console.log('store-read', { Store : data })
        return data
    }
    
    static async List (in_, mode_)
    {
        console.log('list-store', { In : in_ })
        let data, proj

        proj    = { projection: project[Model.verb.view][mode_] }

        switch(mode_)
        {
          case Model.mode.User:
            in_.Query = 
            {
                  State   : Model.states.Registered
                , 'Address.Location': { $geoWithin: { $center: [ [ in_.Latitude.loc(), in_.Longitude.loc()], 2500 ] } } 
            } 

            if(in_.Category) in_.Query.Type     = in_.Category
            if(in_.Text)     in_.Query['$text'] = { $search: in_.Text }

            break
          case Model.mode.Admin:
            switch(in_.Type)
            {
                case Model.qtype.NearList:
                in_.Query = { 'Address.Location': { $geoWithin: { $center: [ [ in_.Latitude.loc(), in_.Longitude.loc()], 2500 ] } } } 

                // TODO check unit of radius 2500

                if(in_.Category) in_.Query.Type     = in_.Category
                if(in_.Text)     in_.Query['$text'] = { $search: in_.Text }

                break
                case Model.qtype.Pending:
                in_.Query = { State : Model.states.ToBeApproved }
                break
                case Model.qtype.NearPending:
                in_.Query = 
                { 
                    'Address.Location'  :
                    { 
                        $near : { $geometry: 
                            { 
                                  type          : 'Point'
                                , coordinates   : [ in_.Longitude.loc(), in_.Latitude.loc() ] 
                            } } 
                    },
                    State     : Model.states.ToBeApproved
                }
                break
            }
            break
        }

        data = await db.store.List(in_, proj)

        rinse[Model.verb.list](data)

        console.log('store-list', { Stores : data, Mode: mode_ })
        return data
    }

    static async Edit (data)
    {
        console.log('edit-store', { Input : data})

        let rcd = { _id : data.Store._id }

        // Refeed for validation
        if(data.Refeed && (data.Store.State != Model.states.Registered))
                             rcd.State       = Model.states.ToBeApproved
        if(data.Email)       rcd.Email       = data.Email
        if(data.Image)       rcd.Image       = data.Image
        if(data.Certs)       rcd.Certs       = data.Certs
        if(data.Type)        rcd.Type        = data.Type
        if(data.Name)        rcd.Name        = data.Name
        if(data.Description) rcd.Description = data.Description        
        if(data.Longitude && data.Latitude)  
                rcd[ 'Address.Location' ] = 
                { 
                        type        : 'Point'
                    , coordinates : [ data.Longitude.loc(), data.Latitude.loc() ]
                }
        if(data.Address)  rcd.Address  = data.Address
        if(data.Status)
        {
            let now_  = new Date()
            let date_ = 
            {
                Minute    : now_.getMinutes()
              , Hour      : now_.getHours()
              , Day       : now_.getDate()
              , Month     : now_.getMonth()
              , Year      : now_.getFullYear()
            }
            rcd.Status = 
            {
                  Current : data.Status
                , SetOn   : date_
            }
        }
        if(data.Time)     rcd.Time     = data.Time
        if(data.Longitude && data.Latitude)
        {
            const data_ = 
            {
                Location : 
                {
                        type      : 'Point'
                    , coordinates : [ data.Longitude.loc(), data.Latitude.loc() ]
                }
            }
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