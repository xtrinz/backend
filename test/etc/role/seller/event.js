const { Method, Type } = require('../../../lib/medium')
    , data             = require('../../data')
    , { read }         = require('../../../lib/driver')
    , Model            = require('../../../../pkg/sys/models')
    , jwt              = require('../../../../pkg/infra/jwt')

let RegisterNew = function(seller_) 
{
    this.SellerID  = seller_
    this.Data     = function()
    {
      let seller = data.Get(data.Obj.Seller, this.SellerID)
      let templ =
      {
          Type                  : Type.Rest
        , Describe              : 'Seller Register New'
        , Request               :
        {
              Method            : Method.POST
            , Path              : '/v1/seller/register'
            , Body              : 
            {
                Task            : Model.task.New
              , MobileNo        : seller.MobileNo
            }
            , Header            : {}
        }
        , Response              :
        {
              Code              : Model.code.OK
            , Status            : Model.status.Success
            , Text              : Model.text.OTPGenerated
            , Data              : {}
        }
      }
      return templ
    }

    this.PostSet        = async function(res_)
    {
      let resp  = await read()
        , seller = data.Get(data.Obj.Seller, this.SellerID)
      seller.OTP = resp.Data.OTP
      data.Set(data.Obj.Seller, this.SellerID, seller)
    }
}

let RegisterReadOTP = function(seller_, journal_) 
{
  this.SellerID  = seller_
  this.JournalID = journal_
  this.Data     = function()
  {
    let seller = data.Get(data.Obj.Seller, this.SellerID)
    let templ =
    {
          Type         : Type.Rest
        , Describe     : 'Seller Register Read_OTP'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/seller/register'
          , Body       : 
          {
              Task     : Model.task.ReadOTP
            , MobileNo : seller.MobileNo
            , OTP      : seller.OTP
          }
          , Header     : {  }
        }
        , Skip         : [ 'Token' ]
        , Response     :
        {
            Code       : Model.code.OK
          , Status     : Model.status.Success
          , Text       : Model.text.OTPConfirmed
          , Data       : { Token : '', Command: Model.command.Register }
        }

    } 
    return templ
  }
  this.PostSet        = async function(res_)
  {
    let journal = data.Get(data.Obj.Journal, this.JournalID)

    let seller   = data.Get(data.Obj.Seller,   this.SellerID)
      , data_   = await jwt.Verify(res_.Data.Token)
    seller.ID    = data_._id
    seller.Token = res_.Data.Token
    data.Set(data.Obj.Seller, this.SellerID, seller)

    journal.Seller.ID = seller.ID

    data.Set(data.Obj.Journal, this.JournalID, journal)
  }  
}

let Register = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let seller  = data.Get(data.Obj.Seller, this.ID)
      let templ =      
      {
          Type            : Type.Rest
        , Describe        : 'Seller Register Register'
        , Request         :
        {
            Method        : Method.POST
          , Path          : '/v1/seller/register'
          , Body          : 
          {
              Task            : Model.task.Register
            , Name            : seller.Name
            , Image           : seller.Image
            , Type            : seller.Type
            , Certs           : seller.Certs
            , Description     : seller.Description
            , MobileNo        : seller.MobileNo
            , Email           : seller.Email
            , ClosingTime     : seller.ClosingTime
            , Address         :
            {
                  Line1       : seller.Address.Line1
                , Line2       : seller.Address.Line2
                , City        : seller.Address.City
                , Longitude   : seller.Address.Longitude
                , Latitude    : seller.Address.Latitude
                , PostalCode  : seller.Address.PostalCode
                , State       : seller.Address.State
                , Country     : seller.Address.Country
            }
          }
          , Header        :
          {
            Authorization : seller.Token
          }
        }
        , Response        :
        {
            Code          : Model.code.OK
          , Status        : Model.status.Success
          , Text          : Model.text.Registered
          , Data          :
          {
              SellerID      : seller.ID
            , Name         : seller.Name
            , MobileNo     : seller.MobileNo
            , Image        : seller.Image
            , Description  : seller.Description
            , Type         : seller.Type
            , Certs        : seller.Certs
            , Address      :
            {
                Line1      : seller.Address.Line1
              , Line2      : seller.Address.Line2
              , City       : seller.Address.City
              , Longitude  : seller.Address.Longitude
              , Latitude   : seller.Address.Latitude
              , PostalCode : seller.Address.PostalCode
              , State      : seller.Address.State
              , Country    : seller.Address.Country
            }
            , ClosingTime  : seller.ClosingTime
            , Email        : seller.Email
            , State        : 'ToBeApproved'
            , Status       : Model.states.Closed
            , Command      : Model.command.LoggedIn
          }
        }
      }
      return templ
    }
}

let RegisterApprove =  function(arbiter_, seller_) 
{
  this.ArbiterID  = arbiter_
  this.SellerID  = seller_
  this.Data     = function()
  {
    let seller = data.Get(data.Obj.Seller, this.SellerID)
    let arbiter = data.Get(data.Obj.Arbiter, this.ArbiterID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Seller Register Approve'
      , Request         :
      {
          Method        : Method.POST
        , Path          : '/v1/seller/register'
        , Body          : 
        {
            Task        : Model.task.Approve
          , SellerID     : seller.ID
          , Action      : Model.task.Approve
        //, Action      : Model.task.Deny
        //, Text        : "Please correct ASDF Field"
        }
        , Header        :
        {
          Authorization : arbiter.Token
        }
      }
      , Response        :
      {
          Code          : Model.code.OK
        , Status        : Model.status.Success
        , Text          : Model.text.Approved
        , Data          : {}
      }
    }
    return templ
  }
}

let Read =   function(client_, seller_) 
{
  this.ClientID   = client_
  this.SellerID  = seller_
  this.Data     = function()
  {
    let seller = data.Get(data.Obj.Seller, this.SellerID)
    let client  = data.Get(data.Obj.Client, this.ClientID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Seller View'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/seller/view'
        , Body          : {}
        , Query         : { SellerID     : seller.ID }
        , Header        : { Authorization : client.Token }
      }
      , Response         :
      {
          Code           : Model.code.OK
        , Status         : Model.status.Success
        , Text           : ''
        , Data           :
        {
            SellerID      : seller.ID
          , Name         : seller.Name
          , Image        : seller.Image
          , Description  : seller.Description
          , Type         : seller.Type
          , Certs        : seller.Certs
          , Address      :
          {
              Line1      : seller.Address.Line1
            , Line2      : seller.Address.Line2
            , City       : seller.Address.City
            , PostalCode : seller.Address.PostalCode
            , State      : seller.Address.State
            , Country    : seller.Address.Country
          }
          , ClosingTime  : seller.ClosingTime          
          , Status       : seller.Status
        }
      }
    }
    return templ
  }
}

let List = function(client_, seller_) 
{
  this.ClientID   = client_
  this.SellerID  = seller_
  this.Data     = function()
  {
    let seller = data.Get(data.Obj.Seller, this.SellerID)
    let client  = data.Get(data.Obj.Client, this.ClientID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Seller List'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/seller/list'
        , Query         :
        {
            Longitude   : '17.20000'
          , Latitude    : '17.20000'
          , Page        : 1
          , Limit       : 8
          , Category    : seller.Type
          , Text        : 'Seller'
        }
        , Body          : { }
        , Header        : { Authorization : client.Token }
      }
      , Response        :
      {
          Code          : Model.code.OK
        , Status        : Model.status.Success
        , Text          : ''
        , Data          :
          [{
              SellerID     : seller.ID
            , Name        : seller.Name
            , Image       : seller.Image
            , Description : seller.Description            
            , Type        : seller.Type
            , ClosingTime : seller.ClosingTime            
            , Status      : seller.Status
          }]
      }
    }
    return templ
  }
}

let Edit = function(seller_) 
{
  this.SellerID  = seller_
  this.Data     = function()
  {
    let seller = data.Get(data.Obj.Seller, this.SellerID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Seller Edit'
      , Request         :
      {
          Method        : Method.PUT
        , Path          : '/v1/seller/edit'
        , Query         : {}
        , Body          : 
        {
            Email       : seller.Email
          , Image       : seller.Image
          , Certs       : seller.Certs
          , Type        : seller.Type
          , Name        : seller.Name
          , Description : seller.Description
          , Longitude   : seller.Longitude
          , Latitude    : seller.Latitude
          , ClosingTime : seller.ClosingTime
          , Status      : seller.Status
          , Refeed      : true
        }
        , Header        : { Authorization : seller.Token }
      }
      , Response        :
      {
          Code          : Model.code.OK
        , Status        : Model.status.Success
        , Text          : Model.text.ProfileUpdated
        , Data          : {}
      }
    }
    return templ
  }
}

let Connect = function(seller_) 
{
    this.ID     = seller_
    this.Data   = function()
    {
      let seller  = data.Get(data.Obj.Seller, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Seller Socket Connect'
        , Method        : Method.CONNECT
        , Authorization : {'auth' : {Token : seller.Token }}
        , Socket        : {}
        , Skip          : []
        , Event         : {}
      }
      return templ
    }
    this.PostSet        = async function(res_)
    {
      if(this.ID.startsWith('Seller')) { await read() } // TODO bug
      let seller    = data.Get(data.Obj.Seller, this.ID)
      seller.Socket = res_.Socket
      seller.Channel= res_.Channel
      data.Set(data.Obj.Seller, this.ID, seller)
    }
}

let Dsc = function(seller_) 
{
    this.ID     = seller_
    this.Data   = function()
    {
      let seller  = data.Get(data.Obj.Seller, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Seller Socket Dsc'
        , Method        : Method.DISCONNECT
        , Authorization : {}
        , Socket        : seller.Socket
        , Skip          : []
        , Event         : {}
      }
      return templ
    }
}



module.exports =
{
      RegisterNew     
    , RegisterReadOTP 
    , Register
    , RegisterApprove // Seller registration sequence
    , Read            
    , List            // Read seller
    , Edit
    , Connect
    , Dsc
}