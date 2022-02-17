const { mode } = require('../../../../pkg/sys/models')
    , sketch   = require('./sketch')
    , view     = require('./view')

let Client = function(journal_) 
{
  this.JournalID = journal_
  this.Data      = function()
  {
    let tmp      = new view.Client(this.JournalID)
    let data_    = tmp.Data().Response.Data

    return sketch.List(mode.Client, data_.JournalID, [ data_ ])
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
let Seller = function(journal_)
{
  this.JournalID = journal_
  this.Data      = function()
  {
    let tmp      = new view.Seller(this.JournalID)
    let data_    = tmp.Data().Response.Data

    return sketch.List(mode.Seller, data_.JournalID, [ data_ ])
  }
}
let Arbiter = function(journal_)
{
  this.JournalID = journal_
  this.Data      = function()
  {
    let tmp      = new view.Arbiter(this.JournalID)
    let data_    = tmp.Data().Response.Data

    return sketch.List(mode.Arbiter, data_.JournalID, [ data_ ])
  }
}

module.exports = { Client, Agent, Arbiter, Seller }