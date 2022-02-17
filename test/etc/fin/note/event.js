const { Method, Type }       = require('../../../lib/medium')
    , data                   = require('../../data')
    , { code, status, text } = require('../../../../pkg/sys/models')

let View = function(client_, note_) 
{
  this.ClientID  = client_
  this.NoteID  = note_
  this.Data     = function()
  {
    let client  = data.Get(data.Obj.Client, this.ClientID)
    let note  = data.Get(data.Obj.Note, this.NoteID)
    let templ =
    {                                  
        Type                 : Type.Rest
      , Describe             : 'Note View'
      , Request              :
      {                                   
            Method           : Method.GET
          , Path             : '/v1/note/view'
          , Body             : {}
          , Query            : { Type : note.Type }                          
          , Header           : { Authorization: client.Token }
      }                                   
      , Response             :
      {                                   
            Code             : code.OK
          , Status           : status.Success
          , Text             : ''
          , Data             :
          {                  
                Type         : note.Type 
              , Body         : note.Body
          }
      }
    }
    return templ
  }
}

let Set = function(arbiter_, note_) 
{
  this.ArbiterID  = arbiter_
  this.NoteID   = note_
  this.Data     = function()
  {
    let arbiter  = data.Get(data.Obj.Arbiter, this.ArbiterID)
    let note   = data.Get(data.Obj.Note, this.NoteID)
    let templ =
    {
        Type                 : Type.Rest
      , Describe             : 'Note Set'
      , Request              :
      {
            Method           : Method.POST
          , Path             : '/v1/note/set'
          , Body             : 
          {
              Type           : note.Type 
            , Body           : note.Body
          }
          , Header           : { Authorization: arbiter.Token }
      }
      , Response             :
      {
          Code               : code.OK
        , Status             : status.Success
        , Text               : text.NoteSet
        , Data               : {}
      }
    }
    return templ
  }
}

let Cloudinary = function(seller_)
{
  this.SellerID  = seller_
  this.Data     = function()
  {
    let seller = data.Get(data.Obj.Seller, this.SellerID)
    let templ =
    {
        Type                 : Type.Rest
      , Describe             : 'Get Image Signature'
      , Request              :
      {
            Method           : Method.POST
          , Path             : '/v1/cloudinary'
          , Query            : {}
          , Body             : {}
          , Header           : { Authorization: seller.Token }
      }
      , Skip                 : [ 'Data' ]
      , Response             :
      {
          Code               : code.OK
        , Status             : status.Success
        , Text               : ''
        , Data               : {}
      }
    }
    return templ
  }
}

module.exports =
{
    View, Set, Cloudinary
}