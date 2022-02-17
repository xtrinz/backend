const otp      = require('../../../infra/otp')
    , jwt      = require('../../../infra/jwt')
    , Model    = require('../../../sys/models')
    , ledger   = require('../../fin/ledger/driver')
    , db       = require('../../exports')[Model.segment.db]
    , Seller   = require('./seller')
    , ObjectId = require('mongodb').ObjectId
    , Tool     = require('../../../tool/export')[Model.resource.seller]
    , Log      = require('../../../sys/log')

const Context	= async function(data, resp)
{
    let seller_

    if(data.Task != Model.task.Approve) 
    { 
        seller_ = await db.seller.Get(data.MobileNo, Model.query.ByMobileNo) 
    }
    else 
    { 
        seller_ = await db.seller.Get(data.SellerID, Model.query.ByID) 
    }

    if (!seller_)
    {
        Log('seller-not-found-setting-new-context', 
        { 
            MobileNo: data.MobileNo 
        })
        seller_ = new Seller()
        seller_.setState(Model.states.None)
        seller_.setID(new ObjectId())
        seller_.setMobileNo(data.MobileNo)
    }

    let ctxt =
    {
          Seller  : seller_
        , Data   : data
        , Return : resp
    }
    Log('seller-context', { Context: ctxt })
    return ctxt
}

const Create	= async function(ctxt)
{
    Log('create-seller', { Context: ctxt })

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Seller.MobileNo, 
                    Body: 	Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Seller.Otp   = hash
    ctxt.Seller.State = Model.states.New

    await db.seller.Save(ctxt.Seller)

    Log('seller-created', { Context: ctxt })

    return {}
}

const Login		= async function(ctxt)
{
    Log('seller-login', { Context: ctxt })

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Seller.MobileNo, 
                    Body: 	    Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Seller.Otp = hash
    await db.seller.Save(ctxt.Seller)

    Log('seller-login-otp-sent', { Context: ctxt })

    return {}
}

const Confirm   = async function (ctxt)
{
    const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
        , status = await otp_.Confirm(ctxt.Seller.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        Log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    const token = await jwt.Sign({ _id : ctxt.Seller._id, Mode : Model.mode.Seller })

    ctxt.Seller.State = Model.states.MobConfirmed
    ctxt.Seller.Otp   = ''
    await db.seller.Save(ctxt.Seller)

    Log('seller-mobile-number-confirmed', { Seller: ctxt.Seller })

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
        , status = await otp_.Confirm(ctxt.Seller.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        Log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    Log('seller-exists-logging-in', { Seller: ctxt.Seller })

    ctxt.Seller.Otp = ''
    await db.arbiter.Save(ctxt.Seller)

    const token = await jwt.Sign({ _id : ctxt.Seller._id, Mode : Model.mode.Seller })

    ctxt.Return.setHeader('authorization', token)
    let data_ = 
    {
        Name      : ctxt.Seller.Name
      , MobileNo  : ctxt.Seller.MobileNo
      , Mode      : ctxt.Seller.Mode
      , Command   : Model.command.LoggedIn
    }
    return data_
}

const Register  = async function (ctxt)
{
    Log('seller-register', { Context: ctxt })

    let seller_ = new Seller(ctxt.Data)
    seller_.setID(ctxt.Seller._id)
    seller_.setState(Model.states.ToBeApproved)

    ctxt.Seller = seller_

    await db.seller.Save(ctxt.Seller)

    Log('seller-registered', { Context: ctxt })

    let in_ =
    {
        ID    : ctxt.Seller._id
      , Mode  : Model.mode.Seller
      , Seller : ctxt.Seller
    }
    let data_       = await Get(in_)
    data_.Command   = Model.command.LoggedIn
    return data_    
}

const Approve  = async function (ctxt)
{
    Log('seller-approve', { Context: ctxt })

    if(ctxt.Data.Action == Model.task.Deny)
    {
        ctxt.Seller.State  = Model.states.ToBeCorrected
        ctxt.Seller.Text   = ctxt.Data.Text
    }
    else
    {
        ctxt.Seller.LedgerID = await ledger.Create(ctxt.Seller)        
        ctxt.Seller.State    = Model.states.Registered
        ctxt.Seller.Text     = ''
    }

    await db.seller.Save(ctxt.Seller)

    Log('arbiter-response-marked', { Seller: ctxt.Seller })
    return {}
}

const Edit = async function(data)
{
    Log('edit-seller', { Input : data })

    let rcd = { _id : data.Seller._id }

    // Refeed for validation
    if(data.Refeed && (data.Seller.State != Model.states.Registered))
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
    await db.seller.Save(rcd)
    Log('seller-updated', { Record: rcd })
}

const Get      = async function (in_)
{
    Log('read-seller', { In: in_ })

    let data, seller_
    switch(in_.Mode)
    {
      case Model.mode.Seller:
        seller_ = in_.Seller
        break

      case Model.mode.Arbiter:
        seller_ = await db.seller.Get(in_.ID, Model.query.ByID)
        if (!seller_) 
        {
            Log('seller-not-found', { In: in_ })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.SellerNotFound)
        }
        break

      case Model.mode.Client:
        seller_ = await db.seller.Get(in_.ID, Model.query.ByID)
        if (!seller_)
        {
            Log('seller-not-found', { In: in_ })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.SellerNotFound)
        }
        if (seller_.State !== Model.states.Registered)
        {
            Log('seller-has-not-registered', { In: in_ })
            Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
        }
        break
      case Model.mode.System:
        seller_ = await db.seller.Get(in_.ID, Model.query.ByID)
        if (!seller_)
        {
            Log('seller-not-found', { In: in_ })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.SellerNotFound)
        }
        if (seller_.State !== Model.states.Registered)
        {
            Log('seller-has-not-registered', { In: in_ })
            Model.Err_(Model.code.FORBIDDEN, Model.reason.PermissionDenied)
        }
        break        
    }

    data = Tool.rinse[Model.verb.view][in_.Mode](seller_)
    Log('seller-read', { Seller : data })
    return data
}

const List      = async  function(in_, mode_)
{
    Log('list-seller', { In : in_ })
    let data, proj

    proj = { projection: Tool.project[Model.verb.list][mode_] }

    Tool.filter[Model.verb.list][mode_](in_)

    data = await db.seller.List(in_, proj)

    Tool.rinse[Model.verb.list][mode_](data)

    Log('seller-list', { Sellers : data, Mode: mode_ })
    return data
}

module.exports =
{
    Create,     Login,      Confirm,
    Token,      Register,   Approve,
    Edit,       Context,    Get,
    List
}