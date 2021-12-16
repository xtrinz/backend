const { mode } = require('../../../pkg/system/models')
    , sketch   = require('./sketch')
    , view     = require('./view')

let User = function(journal_) 
{
  this.JournalID = journal_
  this.Data      = function()
  {
    let tmp      = new view.User(this.JournalID)
    let data_    = tmp.Data().Response.Data

    return sketch.List(mode.User, data_.JournalID, [ data_ ])
  }
}
let Agent = function(journal_)
{
  this.JournalID = journal_
  this.Data      = function()
  {
    let tmp      = new view.Agent(this.JournalID)
    let data_    = tmp.Data().Response.Data

    return sketch.List(mode.Agent, data_.JournalID, [ data_ ])
  }
}
let Store = function(journal_)
{
  this.JournalID = journal_
  this.Data      = function()
  {
    let tmp      = new view.Store(this.JournalID)
    let data_    = tmp.Data().Response.Data

    return sketch.List(mode.Store, data_.JournalID, [ data_ ])
  }
}
let Admin = function(journal_)
{
  this.JournalID = journal_
  this.Data      = function()
  {
    let tmp      = new view.Admin(this.JournalID)
    let data_    = tmp.Data().Response.Data

    return sketch.List(mode.Admin, data_.JournalID, [ data_ ])
  }
}

module.exports = { User, Agent, Admin, Store }