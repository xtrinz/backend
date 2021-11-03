const { Method, Type }       = require('../../lib/medium')
    , data                   = require('../data')
    , { code, status, text } = require('../../../pkg/system/models')

let View = function(user_, note_) 
{
  this.UserID  = user_
  this.NoteID  = note_
  this.Data     = function()
  {
    let user  = data.Get(data.Obj.User, this.UserID)
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
          , Header           : { Authorization: user.Token }
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

let Set = function(admin_, note_) 
{
  this.AdminID  = admin_
  this.NoteID   = note_
  this.Data     = function()
  {
    let admin  = data.Get(data.Obj.User, this.AdminID)
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
          , Header           : { Authorization: admin.Token }
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

let Cloudinary = function(store_)
{
  this.StoreID  = store_
  this.Data     = function()
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
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
          , Header           : { Authorization: store.Token }
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