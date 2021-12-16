const { Method, Type } = require('../../lib/medium')
    , data             = require('../data')
    , { read }         = require('../../lib/driver')
    , Model            = require('../../../pkg/system/models')
    , PaytmChecksum    = require('paytmchecksum')

let Checkout = function(user_, addr_, cart_, cod_) 
{
  this.UserID  	 = user_
  this.AddressID = addr_
  this.CartID    = cart_
  this.COD       = cod_
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
        , Path            : '/v1/journal/create'
        , Body            : 
        {                     
            AddressID     : addr.ID
          , IsCOD         : (this.COD)? true: false
        }                     
        , Header          : { Authorization: user.Token }
      }                       
      , Skip              : [ 'Data' ]                    
      , Response          :
      {                       
          Code            : Model.code.OK
        , Status          : Model.status.Success
        , Text            : Model.text.PaymentInitiated
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
        , Path   : '/v1/paytm/payment'
        , Body   : 
        {
            ORDERID      : cart.Paytm.OrderID
          , TXNID        : cart.Paytm.OrderID
          , TXNDATE      : String(Date.now())
          , STATUS       : Model.paytm.TxnSuccess
          , BANKTXNID    : cart.Paytm.OrderID
          , MID          : cart.Paytm.MID
          , TXNAMOUNT    : cart.Paytm.Amount
          , CHECKSUMHASH : '--pre-set--'
        }
        , Header : {}
      }              
      , Response :
      {              
          Code   : Model.code.OK
        , Status : Model.status.Success
        , Text   : ''
        , Data   : {}
      }
    }

    delete templ.Request.Body.CHECKSUMHASH
    var paytmChecksum = '123' // await PaytmChecksum.generateSignature(templ.Request.Body, process.env.PAYTM_KEY)
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
            Type : Model.alerts.NewOrder
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
          , Path            : '/v1/transit/user'
          , Body            : 
          {
                TransitID   : user.TransitID
              , Task        : Model.task.Cancel
          }
          , Header          : { Authorization: user.Token }
      }
      , Response            :
      {
            Code            : Model.code.OK
          , Status          : Model.status.Success
          , Text            : Model.alerts.Cancelled
          , Data            : {}
      }
    }
    return templ
  }
}

let Cancelled = function(store_) 
{
  this.StoreID = store_
  this.Data    = function()
  {
    let store   = data.Get(data.Obj.Store, this.StoreID)
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert Cancelled ' + store.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : store.Socket
      , Event         : 
      {
          Type : Model.alerts.Cancelled
        , Data : { TransitID : store.TransitID }
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
    let store = data.Get(data.Obj.Store, this.StoreID)
    let templ =
    {
        Type                : Type.Rest
      , Describe            : 'Transit Store Reject'
      , Request             :
      {
            Method          : Method.POST
          , Path            : '/v1/transit/store'
          , Body            : 
          {
                TransitID   : staff.TransitID
              , Task        : Model.task.Reject
          }
          , Header          : { Authorization: store.Token }
      }
      , Response            :
      {
            Code            : Model.code.OK
          , Status          : Model.status.Success
          , Text            : Model.alerts.Rejected
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
          Type : Model.alerts.Rejected
        , Data : { TransitID : user.TransitID }
      }
    }
    return templ
  }
}

let StoreAccept = function(store_, agent_) 
{
  this.StoreID   = store_
  this.AgentID   = agent_
  this.Data      = function()
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
    let templ =
    {
        Type                : Type.Rest
      , Describe            : 'Transit Store Accept'
      , Request             :
      {
            Method          : Method.POST
          , Path            : '/v1/transit/store'
          , Body            : 
          {
                TransitID   : store.TransitID
              , Task        : Model.task.Accept
          }
          , Header          : { Authorization: store.Token }
      }
      , Response            :
      {
            Code            : Model.code.OK
          , Status          : Model.status.Success
          , Text            : Model.alerts.Accepted
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
    let agent  = data.Get(data.Obj.Agent, this.AgentID)
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
          Type : Model.alerts.NewTransit
        , Data : { TransitID : '' }
      }
    }
    return templ
  }

  this.PostSet        = async function(res_)
  {
    let agent        = data.Get(data.Obj.Agent, this.AgentID)
    agent.TransitID  = res_.Data.TransitID
    data.Set(data.Obj.Agent, this.AgentID, agent)
  }
}

let Accepted  = function(name, mode_) 
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

    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert Accepted ' + in_.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : in_.Socket
      , Event         : 
      {
          Type : Model.alerts.Accepted
        , Data : { TransitID : in_.TransitID }
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
          , Path            : '/v1/transit/agent'
          , Body            : 
          {
                TransitID   : agent.TransitID
              , Task        : Model.task.Ignore
          }
          , Header          : { Authorization: agent.Token }
      }
      , Response            :
      {
            Code            : Model.code.OK
          , Status          : Model.status.Success
          , Text            : Model.alerts.Ignored
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
    let admin   = data.Get(data.Obj.Admin, this.AdminID)
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
          Type : Model.alerts.NoAgents
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
    let agent = data.Get(data.Obj.Agent, this.AgentID)
    let templ =
    {
        Type                : Type.Rest
      , Describe            : 'Transit Agent Accept'
      , Request             :
      {
            Method          : Method.POST
          , Path            : '/v1/transit/agent'
          , Body            : 
          {
                TransitID   : agent.TransitID
              , Task        : Model.task.Accept
          }
          , Header          : { Authorization: agent.Token }
      }
      , Response            :
      {
            Code            : Model.code.OK
          , Status          : Model.status.Success
          , Text            : Model.alerts.Accepted
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
          Type : Model.alerts.AgentReady
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
        , Path           : '/v1/transit/store'
        , Body           : 
        {                
              TransitID  : staff.TransitID
            , OTP        : staff.OTP
            , Task       : Model.task.Despatch
        }                 
        , Header         : { Authorization: staff.Token }
      }                  
      , Response         :
      {                    
            Code         : Model.code.OK
          , Status       : Model.status.Success
          , Text         : Model.alerts.EnRoute
          , Data         : {}
      }
    }
    return templ
  }

  this.PostSet = async function(res_)
  {
    let resp  = await read()
      , user  = data.Get(data.Obj.Agent, this.AgentID)
    user.OTP  = resp.Data.OTP
    data.Set(data.Obj.Agent, this.AgentID, user)
  }
}

let EnRoute = function(name_, mode_) 
{
  this.ID   = name_
  this.Mode = mode_
  this.Data = function()
  {
    let data_
    switch (this.Mode) {
      case data.Obj.User:
        data_ = data.Get(data.Obj.User, this.ID)        
        break;
      case data.Obj.Agent:
        data_ = data.Get(data.Obj.Agent, this.ID)        
        break
    }

    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert EnRoute ' + data_.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : data_.Socket
      , Event         : 
      {
          Type : Model.alerts.EnRoute
        , Data : { TransitID : data_.TransitID }
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
    let agent = data.Get(data.Obj.Agent, this.AgentID)
    let templ =
    {
        Type                : Type.Rest
      , Describe            : 'Transit Agent Complete'
      , Request             :
      {
            Method          : Method.POST
          , Path            : '/v1/transit/agent'
          , Body            : 
          {
                OTP         : agent.OTP
              , TransitID   : agent.TransitID
              , Task        : Model.task.Complete
          }
          , Header          : { Authorization: agent.Token }
      }
      , Response            :
      {
            Code            : Model.code.OK
          , Status          : Model.status.Success
          , Text            : Model.alerts.Delivered
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
          Type : Model.alerts.Delivered
        , Data : { TransitID : in_.TransitID }
      }
    }
    return templ
  }
}

let Refund = function(cart_) 
{
  this.CartID    = cart_
  this.Data      = async function()
  {
    let cart        = data.Get(data.Obj.Cart, this.CartID)

    let templ =
    {
        Type     : Type.Rest
      , Describe : 'Confirm Refund'
      , Request  :
      {              
          Method : Method.POST
        , Path   : '/v1/paytm/refund'
        , Body   : 
        {
            orderId       : cart.Paytm.OrderID
          , txnId         : '12345'
          , refundId      : Model.paytm.Order.format(data.orderId.slice( cart.Paytm.OrderID.length - 3))
          , txnTimestamp  : String(Date.now())
          , status        : Model.paytm.RefundSuccess
          , mid           : cart.Paytm.MID
          , refundAmount  : cart.Paytm.Amount
        }
        , Header : 
        {
          signature: '--pre-set--'
        }
      }              
      , Response :
      {              
          Code   : Model.code.OK
        , Status : Model.status.Success
        , Text   : ''
        , Data   : {}
      }
    }

    var paytmChecksum = await PaytmChecksum.generateSignature(templ.Request.Body, process.env.PAYTM_KEY)
    templ.Header.signature = paytmChecksum

    return templ
  }
}

module.exports =
{
      Checkout     , ConfirmPayment , NewOrder
    , CancelByUser , Cancelled      , RejectedByStore
    , Rejected     , StoreAccept    , NewTransit
    , Accepted     , AgentIgnore    , NoAgents
    , AgentAccept  , AgentReady     , StoreDespatch
    , EnRoute      , AgentComplete  , Delivered
    , Refund
}