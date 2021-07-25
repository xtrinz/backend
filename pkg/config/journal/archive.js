const db                     =
    {
        user                 : require('../user/archive')
      , store                : require('../store/archive')
    }
    , { ObjectId }           = require('mongodb')
    , { Err_, code, reason } = require('../../common/error')
    , { entity, query }      = require('../../common/models')
    , { journals }           = require('../../common/database')

const GetByID    = async function(_id)
{
    console.log('find-journal-by-id', { ID : _id })

    const query = { _id : ObjectId(_id) }

    let journal = await journals.findOne(query)
    if (!journal)
    {
      console.log('journal-not-found', { ID : query })
      return
    }
    console.log('journal-found', { Journal : journal })
    return journal
}

const Save       = async function(data)
{
    console.log('save-journal', { Journal : data })
    const query = { _id    : data._id }
        , act   = { $set   : data     }
        , opt   = { upsert : true     }
    const resp  = await journals.updateOne(query, act, opt)
    if (!resp.result.ok)
    {
        console.log('journal-save-failed', { 
            Query   : query
          , Action  : act
          , Option  : opt
          , Result  : resp.result})

        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('journal-saved', { Journal : data })
}

const List = function(data)
{
  switch(data.Entity)
  {
        case entity.User:

        const user_ = db.user.Get(data.UserID, query.ByID)
        if (!user_) Err_(code.NOT_FOUND, reason.UserNotFound)

        const data_ = {}
        /* const query =
        { 
            Buyer :  { UserID : user._id }
          , Payment: { Status : states.Success } 
        }
        , proj  = 
        {
            _id      : 1
          , Seller   : { ID : 1 , Name : 1 }
          , Bill     : 1
          , Products : 1
          , Transit  : { ID : 1 , Status : 1, ClosingState: 1 }
        }
        const data_   = this.Get(query, proj) */
        return data_

        case entity.Store:

        const key =
        { 
          $or :
          [ 
            { 
                  AdminID : data.UserID
                , StoreID : data.StoreID
            },
            { 
                StoreID              : data.StoreID
              , 'StaffList.Approved' : { $elemMatch: { $eq: String(data.UserID) } }
            }
          ]
        }
        const store_ = db.store.Get(key, query.Custom)
        if (!store_) Err_(code.NOT_FOUND, reason.StoreNotFound)
        break
  }
}

const Read = function(data)
{
  let data_
  switch(data.Entity)
  {
        case entity.User:
        return data_

        case entity.Store:
        return data_      
  }
}

module.exports =
{
    GetByID : GetByID
  , Save    : Save
  , List    : List
  , Read    : Read
}