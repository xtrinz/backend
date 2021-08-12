const { Method, Type } = require('../../lib/medium')
    , { code, status } = require('../../../pkg/common/error')
    , { mode }         = require('../../../pkg/common/models')

let View = function(journal_, user_) 
{
    this.UserID    = user_
    this.JournalID = journal_

    this.Data      = function()
    {
      let journal = data.Get(data.Obj.Store, this.JournalID)
        , user    = data.Get(data.Obj.User,  this.UserID)
        , data
        switch (user.Mode)
        {
            case mode.User:
            data = 
            {
                  _id         : 'product'
                , StoreID     : 'store'
                , Name        : 'product'
                , Image       : 'product'
                , Price       : 'product'
                , Quantity    : 'product'
                , Description : 'product'
                , CategoryID  : 'product'
            }
            break;
            case mode.Agent:
                
            break;
            case mode.Admin:
                
            break;
        }

      let templ   =
      {
          Type               : Type.Rest
        , Describe           : 'Journal View'
        , Request            :
        {
              Method         : Method.GET
            , Path           : '/journal/view'
            , Body           : {}
            , Query          : 
            {
                  ProductID  : product.ID
            }
            , Header         : { Authorization: 'Bearer ' + user.Token }
        }
        , Response           :
        {
            Code             : code.OK
          , Status           : status.Success
          , Text             : ''
          , Data             : data
        }
      }
    return templ
  }
}

module.exports =
{
    View
  //, List
}