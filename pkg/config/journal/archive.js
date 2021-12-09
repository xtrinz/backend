const { ObjectId }                  = require('mongodb')
    , { Err_, code, reason, dbset } = require('../../system/models')
    , { journals }                  = require('../../system/database')
    , Log                           = require('../../system/logger')

const GetByID    = async function(_id)
{
    Log('find-journal-by-id', { ID : _id })

    const query = { _id : ObjectId(_id) }

    let journal = await journals.findOne(query)
    if (!journal)
    {
      Log('journal-not-found', { ID : query })
      return
    }
    Log('journal-found', { Journal : journal })
    return journal
}


const Find    = async function(query)
{
    Log('find-journal-by-custom-query', { Query : query})

    const journal = await journals.findOne(query)
    if (!journal)
    {
      Log('journal-not-found-by-custom-query', { Query : query })
      return 
    }
    Log('journal-found-by-custom-query', { Journal : journal })
    return journal
}

const Get    = async function(query, proj)
{
    Log('find-journal-by-custom-query', { Query : query, Projection : proj })

    const journal = await journals.findOne(query, proj)
    if (!journal)
    {
      Log('journal-not-found-by-custom-query', { Query : query, Projection : proj })
      Err_(code.INTERNAL_SERVER, reason.JournalNotFound)
    }
    Log('journal-found-by-custom-query', { Journal : journal })
    return journal
}

const GetMany    = async function(query, proj, cond_)
{
    Log('list-journals', { Query : JSON.stringify(query), Projection : proj })

    const skip = (cond_.Page > 0)? (cond_.Page - 1) * cond_.Limit : 0
        , lmt  = (cond_.Limit > dbset.Limit)? dbset.Limit : cond_.Limit 
        , resp = await journals.find(query, proj)
                               .skip(skip)
                               .limit(lmt)
                               .toArray()
    if (!resp.length)
    {
      Log('no-journal-found', { Query : query, Projection : proj })
      return resp
    }
    Log('journals-found', { Journals : resp })
    return resp
}

const Save       = async function(data)
{
    Log('save-journal', { Journal : data })
    const query = { _id    : data._id }
        , act   = { $set   : data     }
        , opt   = { upsert : true     }
    const resp  = await journals.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        Log('journal-save-failed', { 
            Query   : query
          , Action  : act
          , Option  : opt
          , Result  : resp.result})

        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    Log('journal-saved', { Journal : data })
}

module.exports =
{
    GetByID, Save   
  , Get    , GetMany
  , Find
}