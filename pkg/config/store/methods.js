const otp      = require('../../infra/otp')
    , jwt      = require('../../infra/jwt')
    , Model    = require('../../system/models')
    , db       = require('../exports')[Model.segment.db]
    , Store    = require('./store')
    , ObjectId = require('mongodb').ObjectId
    , Tool     = require('../../tools/export')[Model.resource.store]
    , Log      = require('../../system/log')

const Context	= async function(data, resp)
{
    let store_

    if(data.Task != Model.task.Approve) 
    { 
        store_ = await db.store.Get(data.MobileNo, Model.query.ByMobileNo) 
    }
    else 
    { 
        store_ = await db.store.Get(data.StoreID, Model.query.ByID) 
    }

    if (!store_)
    {
        Log('store-not-found-setting-new-context', 
        { 
            MobileNo: data.MobileNo 
        })
        store_ = new Store()
        store_.setState(Model.states.None)
        store_.setID(new ObjectId())
        store_.setMobileNo(data.MobileNo)
    }

    let ctxt =
    {
          Store  : store_
        , Data   : data
        , Return : resp
    }
    Log('store-context', { Context: ctxt })
    return ctxt
}

const Create	= async function(ctxt)
{
    Log('create-store', { Context: ctxt })

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Store.MobileNo, 
                    Body: 	Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Store.Otp   = hash
    ctxt.Store.State = Model.states.New

    await db.store.Save(ctxt.Store)

    Log('store-created', { Context: ctxt })

    return {}
}

const Login		= async function(ctxt)
{
    Log('store-login', { Context: ctxt })

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Store.MobileNo, 
                    Body: 	    Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Store.Otp = hash
    await db.store.Save(ctxt.Store)

    Log('store-login-otp-sent', { Context: ctxt })

    return {}
}

const Confirm   = async function (ctxt)
{
    const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
        , status = await otp_.Confirm(ctxt.Store.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        Log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    const token = await jwt.Sign({ _id : ctxt.Store._id, Mode : Model.mode.Store })

    ctxt.Store.State = Model.states.MobConfirmed
    ctxt.Store.Otp   = ''
    await db.store.Save(ctxt.Store)

    Log('store-mobile-number-confirmed', { Store: ctxt.Store })

    ctxt.Return.setHeader('authorization', token)
    let data_ = 
    {
       Command   : Model.command.Register
    }
    return data_
}

const Token     = async function (ctxt)
{
    const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
        , status = await otp_.Confirm(ctxt.Store.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        Log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    Log('store-exists-logging-in', { Store: ctxt.Store })

    const token = await jwt.Sign({ _id : ctxt.Store._id, Mode : Model.mode.Store })

    ctxt.Return.setHeader('authorization', token)
    let data_ = 
    {
        Name      : ctxt.Store.Name
      , MobileNo  : ctxt.Store.MobileNo
      , Mode      : ctxt.Store.Mode
      , Command   : Model.command.LoggedIn
    }
    return data_
}

const Register  = async function (ctxt)
{
    Log('store-register', { Context: ctxt })

    let store_ = new Store(ctxt.Data)
    store_.setID(ctxt.Store._id)
    store_.setState(Model.states.ToBeApproved)

    ctxt.Store = store_

    await db.store.Save(ctxt.Store)

    Log('store-registered', { Context: ctxt })

    let in_ =
    {
        ID    : ctxt.Store._id
      , Mode  : Model.mode.Store
      , Store : ctxt.Store
    }
    let data_       = await Get(in_)
    data_.Command   = Model.command.LoggedIn
    return data_    
}

const Approve  = async function (ctxt)
{
    Log('store-approve', { Context: ctxt })

    if(ctxt.Data.Action == Model.task.Deny)
    {
        ctxt.Store.State  = Model.states.ToBeCorrected
        ctxt.Store.Text   = ctxt.Data.Text
    }
    else
    {
        ctxt.Store.State  = Model.states.Registered
        ctxt.Store.Text   = ''
    }

    await db.store.Save(ctxt.Store)

    Log('admin-response-marked', { Store: ctxt.Store })
    return {}
}

const Edit = async function(data)
{
    Log('edit-store', { Input : data })

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
    if(data.ClosingTime) rcd.ClosingTime = data.ClosingTime
    if(data.Longitude && data.Latitude)  
            rcd[ 'Address.Location' ] = 
            { 
                    type        : 'Point'
                , coordinates : [ data.Longitude.loc(), data.Latitude.loc() ]
            }
    if(data.Address)  rcd.Address  = data.Address
    if(data.Status)
    {
        // TODO return error if after ClosingTime
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
    Log('store-updated', { Record: rcd })
}

const Get      = async function (in_)
{
    Log('read-store', { In: in_ })

    let data, store_
    switch(in_.Mode)
    {
      case Model.mode.Store:
        store_ = in_.Store
        break

      case Model.mode.Admin:
        store_ = await db.store.Get(in_.ID, Model.query.ByID)
        if (!store_) 
        {
            Log('store-not-found', { In: in_ })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.StoreNotFound)
        }
        break

      case Model.mode.User:
        store_ = await db.store.Get(in_.ID, Model.query.ByID)
        if (!store_)
        {
            Log('store-not-found', { In: in_ })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.StoreNotFound)
        }
        if (store_.State !== Model.states.Registered)
        {
            Log('store-has-not-registered', { In: in_ })
            Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
        }
        break
      case Model.mode.System:
        store_ = await db.store.Get(in_.ID, Model.query.ByID)
        if (!store_)
        {
            Log('store-not-found', { In: in_ })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.StoreNotFound)
        }
        if (store_.State !== Model.states.Registered)
        {
            Log('store-has-not-registered', { In: in_ })
            Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
        }
        break        
    }

    data = Tool.rinse[Model.verb.view][in_.Mode](store_)
    Log('store-read', { Store : data })
    return data
}

const List      = async  function(in_, mode_)
{
    Log('list-store', { In : in_ })
    let data, proj

    proj = { projection: Tool.project[Model.verb.view][mode_] }

    Tool.filter[Model.verb.list][mode_](in_)

    data = await db.store.List(in_, proj)

    Tool.rinse[Model.verb.list](data)

    Log('store-list', { Stores : data, Mode: mode_ })
    return data
}

module.exports =
{
    Create,     Login,      Confirm,
    Token,      Register,   Approve,
    Edit,       Context,    Get,
    List
}