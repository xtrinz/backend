const { ObjectId }                  = require('mongodb')
    , { Err_, code, reason, dbset } = require('../../system/models')
    , { channels }                  = require('../../system/database')

const GetByID    = async function(_id)
{
    console.log('find-channle-by-id', { ID : _id })

    const query = { _id : ObjectId(_id) }

    let channle = await channels.findOne(query)
    if (!channle)
    {
      console.log('channle-not-found', { ID : query })
      return
    }
    console.log('channle-found', { Channel : channle })
    return channle
}

const Get    = async function(query, proj)
{
    console.log('find-channle-by-custom-query', { Query : query, Projection : proj })

    const channle = await channels.findOne(query, proj)
    if (!channle)
    {
      console.log('channle-not-found-by-custom-query', { Query : query, Projection : proj })
      Err_(code.INTERNAL_SERVER, reason.JournalNotFound)
    }
    console.log('channle-found-by-custom-query', { Channel : channle })
    return channle
}

const GetMany    = async function(query, proj, cond_)
{
    console.log('list-channels', { Query : query, Projection : proj })

    const skip = (cond_.Page > 0)? (cond_.Page - 1) * cond_.Limit : 0
        , lmt  = (cond_.Limit > dbset.Limit)? dbset.Limit : cond_.Limit 
        , resp = await channels.find(query, proj)
                               .skip(skip)
                               .limit(lmt)
                               .toArray()
    if (!resp)
    {
      console.log('no-channle-found', { Query : query, Projection : proj })
      Err_(code.INTERNAL_SERVER, reason.JournalNotFound)
    }
    console.log('channels-found', { channels : resp })
    return resp
}

const Save       = async function(data)
{
    console.log('save-channle', { Channel : data })
    const query = { _id    : data._id }
        , act   = { $set   : data     }
        , opt   = { upsert : true     }
    const resp  = await channels.updateOne(query, act, opt)
    if (!resp.result.ok)
    {
        console.log('channle-save-failed', { 
            Query   : query
          , Action  : act
          , Option  : opt
          , Result  : resp.result})

        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('channle-saved', { Channel : data })
}

module.exports =
{
    GetByID : GetByID
  , Save    : Save
  , Get     : Get
  , GetMany : GetMany
}