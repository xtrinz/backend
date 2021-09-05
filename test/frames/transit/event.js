const { Method, Type }        = require('../../lib/medium')
    , data                    = require('../data')
    , { read }                = require('../../lib/driver')
    , { code, status, text }  = require('../../../pkg/common/error')
    , { alerts, task, paytm } = require('../../../pkg/common/models')
    , PaytmChecksum           = require('paytmchecksum')

let Checkout = function(user_, addr_, cart_) 
{
  this.UserID  	 = user_
  this.AddressID = addr_
  this.CartID    = cart_
  this.Data      = function()
  {
    let user     = data.Get(data.Obj.User,    this.UserID)
    let addr     = data.Get(data.Obj.Address, this.AddressID)

    let templ =
    {
        Type              : Type.Rest
      , Describe          : 'Cart Checkout'
      , Request           :
      {                     
          Method          : Method.POST
        , Path            : '/checkout'
        , Body            : 
        {                     
            Longitude     : addr.Longitude
          , Latitude      : addr.Latitude
          , AddressID     : addr.ID
        }                     
        , Header          : { Authorization: user.Token }
      }                       
      , Skip              : [ 'Data' ]                    
      , Response          :
      {                       
          Code            : code.OK
        , Status          : status.Success
        , Text            : text.PaymentInitiated
        , Data            :
        {
              Token       : ''
            , OrderID     : ''
            , Amount      : ''
            , MID         : ''
            , CallBackURL : ''
        }
      }
    }
    return templ
  }
  this.PostSet        = async function(res_)
  {
    let cart        = data.Get(data.Obj.Cart, this.CartID)
    // Clear Cart
    cart.Products     = [] // { ProductID, Name, Image, Price, Quantity } 
    cart.Bill         = 
    {                 
          Total       : 0
        , TransitCost : 0
        , Tax         : 0
        , NetPrice    : 0
    }
    cart.Paytm        = 
    {
        Token         : res_.Data.Token
      , OrderID       : res_.Data.ID
      , MID           : res_.Data.MID
      , Amount        : res_.Data.Amount
      , CallBackURL   : res_.Data.CallBackURL
    }
    data.Set(data.Obj.Cart, this.CartID, cart)
  }
}

let ConfirmPayment = function(cart_) 
{
  this.CartID    = cart_
  this.Data      = async function()
  {
    let cart        = data.Get(data.Obj.Cart, this.CartID)

    let templ =
    {
        Type     : Type.Rest
      , Describe : 'Confirm Payment'
      , Request  :
      {              
          Method : Method.POST
        , Path   : '/paytm/payment'
        , Body   : 
        {
            ORDERID      : cart.Paytm.OrderID
          , TXNID        : cart.Paytm.OrderID
          , TXNDATE      : String(Date.now())
          , STATUS       : paytm.TxnSuccess
          , BANKTXNID    : cart.Paytm.OrderID
          , MID          : cart.Paytm.MID
          , TXNAMOUNT    : cart.Paytm.Amount
          , CHECKSUMHASH : '--pre-set--'
        }
        , Header : {}
      }              
      , Response :
      {              
          Code   : code.OK
        , Status : status.Success
        , Text   : ''
        , Data   : {}
      }
    }

    delete templ.Request.Body.CHECKSUMHASH
    var paytmChecksum = await PaytmChecksum.generateSignature(templ.Request.Body, process.env.PAYTM_KEY)
    templ.Request.Body.CHECKSUMHASH = paytmChecksum

    return templ
  }
}

let NewOrder = function(name, mode_) 
{
    this.ID     = name
    this.Mode   = mode_
    this.Data   = function()
    {
      let in_
      switch (this.Mode) {
        case data.Obj.User:
          in_  = data.Get(data.Obj.User, this.ID)          
          break;
        case data.Obj.Store:
          in_  = data.Get(data.Obj.Store, this.ID)          
          break;
      }

      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Transit Alert New_Order ' + in_.Name
        , Method        : Method.EVENT
        , Authorization : {}
        , Socket        : in_.Socket
        , Skip          : [ 'TransitID' ]
        , Event         : 
        {
            Type : alerts.NewOrder
          , Data : { TransitID : '' }
        }
      }
      return templ
    }
    this.PostSet        = async function(res_)
    {
      let in_
      switch (this.Mode) {
        case data.Obj.User:
          in_  = data.Get(data.Obj.User, this.ID)
          in_.TransitID  = res_.Data.TransitID
          data.Set(data.Obj.User, this.ID, in_)
          break;

        case data.Obj.Store:
          in_  = data.Get(data.Obj.Store, this.ID)          
          in_.TransitID  = res_.Data.TransitID
          data.Set(data.Obj.Store, this.ID, in_)
          break;
      }      

    }
}

let CancelByUser = function(user_) 
{
  this.UserID    = user_
  this.Data      = function()
  {
    let user = data.Get(data.Obj.User, this.UserID)
    let templ =
    {
        Type                : Type.Rest
      , Describe            : 'Transit Cancel By User'
      , Request             :
      {
            Method          : Method.POST
          , Path            : '/transit/user'
          , Body            : 
          {
                TransitID   : user.TransitID
              , Task        : task.Cancel
          }
          , Header          : { Authorization: user.Token }
      }
      , Response            :
      {
            Code            : code.OK
          , Status          : status.Success
          , Text            : alerts.Cancelled
          , Data            : {}
      }
    }
    return templ
  }
}

let Cancelled = function(user_) 
{
  this.UserID  = user_
  this.Data    = function()
  {
    let user   = data.Get(data.Obj.User, this.UserID)
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert Cancelled ' + user.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : user.Socket
      , Event         : 
      {
          Type : alerts.Cancelled
        , Data : { TransitID : user.TransitID }
      }
    }
    return templ
  }
}

let RejectedByStore = function(store_) 
{
  this.StoreID   = store_
  this.Data      = function()
  {
    let staff = data.Get(data.Obj.Store, this.StoreID)
    let templ =
    {
        Type                : Type.Rest
      , Describe            : 'Transit Store Reject'
      , Request             :
      {
            Method          : Method.POST
          , Path            : '/transit/store'
          , Body            : 
          {
                TransitID   : staff.TransitID
              , Task        : task.Reject
          }
          , Header          : { Authorization: staff.Token }
      }
      , Response            :
      {
            Code            : code.OK
          , Status          : status.Success
          , Text            : alerts.Rejected
          , Data            : {}
      }
    }
    return templ
  }
}

let Rejected = function(user_) 
{
  this.UserID  = user_
  this.Data    = function()
  {
    let user   = data.Get(data.Obj.User, this.UserID)
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert Rejected ' + user.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : user.Socket
      , Event         : 
      {
          Type : alerts.Rejected
        , Data : { TransitID : user.TransitID }
      }
    }
    return templ
  }
}

let StoreAccept = function(store_) 
{
  this.StoreID   = store_
  this.Data      = function()
  {
    let staff = data.Get(data.Obj.Store, this.StoreID)
    let templ =
    {
        Type                : Type.Rest
      , Describe            : 'Transit Store Accept'
      , Request             :
      {
            Method          : Method.POST
          , Path            : '/transit/store'
          , Body            : 
          {
                TransitID   : staff.TransitID
              , Task        : task.Accept
          }
          , Header          : { Authorization: staff.Token }
      }
      , Response            :
      {
            Code            : code.OK
          , Status          : status.Success
          , Text            : alerts.Accepted
          , Data            : {}
      }
    }
    return templ
  }
}

let NewTransit = function(agent_) 
{
  this.AgentID = agent_
  this.Data    = function()
  {
    let agent  = data.Get(data.Obj.User, this.AgentID)
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert New_Transit ' + agent.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : agent.Socket
      , Skip          : [ 'TransitID' ]
      , Event         : 
      {
          Type : alerts.NewTransit
        , Data : { TransitID : '' }
      }
    }
    return templ
  }

  this.PostSet        = async function(res_)
  {
    let agent        = data.Get(data.Obj.User, this.AgentID)
    agent.TransitID  = res_.Data.TransitID
    data.Set(data.Obj.User, this.AgentID, agent)
  }
}

let Accepted = function(user_) 
{
  this.UserID  = user_
  this.Data    = function()
  {
    let user   = data.Get(data.Obj.User, this.UserID)
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert Accepted ' + user.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : user.Socket
      , Event         : 
      {
          Type : alerts.Accepted
        , Data : { TransitID : user.TransitID }
      }
    }
    return templ
  }
}

let AgentIgnore = function(agent_) 
{
  this.AgentID   = agent_
  this.Data      = function()
  {
    let agent = data.Get(data.Obj.User, this.AgentID)
    let templ =
    {
        Type                : Type.Rest
      , Describe            : 'Transit Agent Ignore'
      , Request             :
      {
            Method          : Method.POST
          , Path            : '/transit/agent'
          , Body            : 
          {
                TransitID   : agent.TransitID
              , Task        : task.Ignore
          }
          , Header          : { Authorization: agent.Token }
      }
      , Response            :
      {
            Code            : code.OK
          , Status          : status.Success
          , Text            : alerts.Ignored
          , Data            : {}
      }
    }
    return templ
  }
}

let NoAgents = function(admin_) 
{
  this.AdminID = admin_
  this.Data    = function()
  {
    let admin   = data.Get(data.Obj.User, this.AdminID)
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert NoAgents ' + admin.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : admin.Socket
      , Skip          : [ 'TransitID' ]
      , Event         : 
      {
          Type : alerts.NoAgents
        , Data : { TransitID : admin.TransitID }
      }
    }
    return templ
  }
}


let AgentAccept =  function(agent_, store_) 
{
  this.AgentID   = agent_
  this.StoreID   = store_  
  this.Data      = function()
  {
    let agent = data.Get(data.Obj.User, this.AgentID)
    let templ =
    {
        Type                : Type.Rest
      , Describe            : 'Transit Agent Accept'
      , Request             :
      {
            Method          : Method.POST
          , Path            : '/transit/agent'
          , Body            : 
          {
                TransitID   : agent.TransitID
              , Task        : task.Accept
          }
          , Header          : { Authorization: agent.Token }
      }
      , Response            :
      {
            Code            : code.OK
          , Status          : status.Success
          , Text            : alerts.Accepted
          , Data            : {}
      }
    }
    return templ
  }
  
  this.PostSet = async function(res_)
  {
    let resp  = await read()
      , user  = data.Get(data.Obj.Store, this.StoreID)
    user.OTP  = resp.Data.OTP
    data.Set(data.Obj.Store, this.StoreID, user)
  }
}

let AgentReady = function(name_, mode_) 
{
  this.ID      = name_
  this.Mode    = mode_
  this.Data    = function()
  {
    let in_
    switch (this.Mode) {
      case data.Obj.User:
        in_  = data.Get(data.Obj.User, this.ID)          
        break;
      case data.Obj.Store:
        in_  = data.Get(data.Obj.Store, this.ID)          
        break;
    }
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert AgentReady ' + in_.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : in_.Socket
      , Event         : 
      {
          Type : alerts.AgentReady
        , Data : { TransitID : in_.TransitID }
      }
    }
    return templ
  }
}

let StoreDespatch = function(store_, agent_) 
{
  this.StoreID   = store_
  this.AgentID   = agent_
  this.Data      = function()
  {
    let staff = data.Get(data.Obj.Store, this.StoreID)
    let templ =
    {
        Type             : Type.Rest
      , Describe         : 'Transit Store Despatch'
      , Request          :
      {                  
          Method         : Method.POST
        , Path           : '/transit/store'
        , Body           : 
        {                
              TransitID  : staff.TransitID
            , OTP        : staff.OTP
            , Task       : task.Despatch
        }                 
        , Header         : { Authorization: staff.Token }
      }                  
      , Response         :
      {                    
            Code         : code.OK
          , Status       : status.Success
          , Text         : alerts.EnRoute
          , Data         : {}
      }
    }
    return templ
  }

  this.PostSet = async function(res_)
  {
    let resp  = await read()
      , user  = data.Get(data.Obj.User, this.AgentID)
    user.OTP  = resp.Data.OTP
    data.Set(data.Obj.User, this.AgentID, user)
  }
}

let EnRoute = function(user_) 
{
  this.UserID  = user_
  this.Data    = function()
  {
    let user   = data.Get(data.Obj.User, this.UserID)
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert EnRoute ' + user.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : user.Socket
      , Event         : 
      {
          Type : alerts.EnRoute
        , Data : { TransitID : user.TransitID }
      }
    }
    return templ
  }
}

let AgentComplete = function(agent_) 
{
  this.AgentID   = agent_
  this.Data      = function()
  {
    let agent = data.Get(data.Obj.User, this.AgentID)
    let templ =
    {
        Type                : Type.Rest
      , Describe            : 'Transit Agent Complete'
      , Request             :
      {
            Method          : Method.POST
          , Path            : '/transit/agent'
          , Body            : 
          {
                OTP         : agent.OTP
              , TransitID   : agent.TransitID
              , Task        : task.Complete
          }
          , Header          : { Authorization: agent.Token }
      }
      , Response            :
      {
            Code            : code.OK
          , Status          : status.Success
          , Text            : alerts.Delivered
          , Data            : {}
      }
    }
    return templ
  }
}

let Delivered = function(name_, mode_) 
{
  this.ID  = name_
  this.Mode = mode_
  this.Data    = function()
  {
    let in_
    switch (this.Mode) {
      case data.Obj.User:
        in_  = data.Get(data.Obj.User, this.ID)          
        break;
      case data.Obj.Store:
        in_  = data.Get(data.Obj.Store, this.ID)          
        break;
    }
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert Delivered ' + in_.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : in_.Socket
      , Event         : 
      {
          Type : alerts.Delivered
        , Data : { TransitID : in_.TransitID }
      }
    }
    return templ
  }
}

module.exports =
{
      Checkout
    , ConfirmPayment
    , NewOrder
    , CancelByUser
    , Cancelled
    , RejectedByStore
    , Rejected
    , StoreAccept
    , NewTransit
    , Accepted
    , AgentIgnore
    , NoAgents
    , AgentAccept
    , AgentReady
    , StoreDespatch
    , EnRoute
    , AgentComplete
    , Delivered
}