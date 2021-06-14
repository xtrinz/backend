const { Method, Type }        = require("../../lib/medium")
    , data                    = require("../data/data")
    , { read }                = require("../../lib/driver")
    , { code, status, text }  = require("../../../pkg/common/error")
    , { alerts, task }        = require("../../../pkg/common/models")

let Checkout = function(user_, addr_, cart_) 
{
  this.UserID  	 = user_
  this.AddressID = addr_
  this.CartID    = cart_
  this.Data      = function()
  {
    let user     = data.Get(data.Obj.User,    this.UserID)
    let addr     = data.Get(data.Obj.Address, this.AddressID)
    let cart     = data.Get(data.Obj.Cart,    this.CartID)

    let templ =
    {
        Type              : Type.Rest
      , Describe          : 'Cart Checkout'
      , Request           :
      {                     
          Method          : Method.POST
        , Path            : '/journal/create'
        , Body            : 
        {                     
            Longitude     : addr.Longitude
          , Latitude      : addr.Latitude
          , Address       : addr.Address
        }                     
        , Header          : { Authorization: 'Bearer ' + user.Token }
      }                       
      , Skip              : [ 'Stripe' ]                    
      , Response          :
      {                       
          Code            : code.OK
        , Status          : status.Success
        , Text            : text.PaymentInitiated
        , Data            :
        {                       
          Sheet           :
          {                     
            Products      : cart.Products
          , Bill          : 
            {                 
              Total       : cart.Bill.Total
            , TransitCost : cart.Bill.TransitCost
            , Tax         : cart.Bill.Tax
            , NetPrice    : cart.Bill.NetPrice
            }               
          }                 
          , Stripe        : {}
        }
      }
    }
    return templ
  }
  this.PostSet        = async function(res_)
  {
    let cart        = data.Get(data.Obj.Cart, this.CartID)
    cart.Products     = [] // { ProductID, Name, Image, Price, Quantity } 
    cart.Bill         = 
    {                 
          Total       : 0
        , TransitCost : 0
        , Tax         : 0
        , NetPrice    : 0
    }
    data.Set(data.Obj.Cart, this.CartID, cart)
  }
}

let ConfirmPayment = function() 
{
  this.Data      = function()
  {
    let templ =
    {
        Type     : Type.Rest
      , Describe : 'Confirm Payment'
      , Request  :
      {              
          Method : Method.POST
        , Path   : '/journal/confirm'
        , Body   : {/* Masked Sign Verification for test */}
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
    return templ
  }
}

let NewOrder = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Transit Alert New_Order ' + user.Name
        , Method        : Method.EVENT
        , Authorization : {}
        , Socket        : user.Socket
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
      let user        = data.Get(data.Obj.User, this.ID)
      user.TransitID  = res_.Data.TransitID
      data.Set(data.Obj.User, this.ID, user)
    }
}

let StoreAccept = function(staff_) 
{
  this.StaffID   = staff_
  this.Data      = function()
  {
    let staff = data.Get(data.Obj.User, this.StaffID)
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
          , Header          : { Authorization: 'Bearer ' + staff.Token }
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

let AgentAccept =  function(agent_, staff_) 
{
  this.AgentID   = agent_
  this.StaffID   = staff_  
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
          , Header          : { Authorization: 'Bearer ' + agent.Token }
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
      , user  = data.Get(data.Obj.User, this.StaffID)
    user.OTP  = resp.Data.OTP
    data.Set(data.Obj.User, this.StaffID, user)
  }
}

let AgentReady = function(user_) 
{
  this.UserID  = user_
  this.Data    = function()
  {
    let user   = data.Get(data.Obj.User, this.UserID)
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert AgentReady ' + user.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : user.Socket
      , Event         : 
      {
          Type : alerts.AgentReady
        , Data : { TransitID : user.TransitID }
      }
    }
    return templ
  }
}

let StoreDespatch = function(staff_, agent_) 
{
  this.StaffID   = staff_
  this.AgentID   = agent_
  this.Data      = function()
  {
    let staff = data.Get(data.Obj.User, this.StaffID)
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
        , Header         : { Authorization: 'Bearer ' + staff.Token }
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
          , Header          : { Authorization: 'Bearer ' + agent.Token }
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

let Delivered = function(user_) 
{
  this.UserID  = user_
  this.Data    = function()
  {
    let user   = data.Get(data.Obj.User, this.UserID)
    let templ  =      
    {
        Type          : Type.Event
      , Describe      : 'Transit Alert Delivered ' + user.Name
      , Method        : Method.EVENT
      , Authorization : {}
      , Socket        : user.Socket
      , Event         : 
      {
          Type : alerts.Delivered
        , Data : { TransitID : user.TransitID }
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
    , StoreAccept
    , NewTransit
    , Accepted
    , AgentAccept
    , AgentReady
    , StoreDespatch
    , EnRoute
    , AgentComplete
    , Delivered
}