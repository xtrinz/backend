const { ObjectId } = require('mongodb')
    , Model        = require('../../../sys/models')
    , Log          = require('../../../sys/log')
    , { db }       = require('../../../sys/database')

const GetByID    = async function(id)
{
    Log('find-journal-by-id', { ID : id })

    const query = { _id : ObjectId(id) }

    let journal = await db().journals.findOne(query)    
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

    const journal = await db().journals.findOne(query)
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

    const journal = await db().journals.findOne(query, proj)
    if (!journal)
    {
      Log('journal-not-found-by-custom-query', { Query : query, Projection : proj })
      Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.JournalNotFound)
    }
    Log('journal-found-by-custom-query', { Journal : journal })
    return journal
}

const GetMany    = async function(query, proj, cond_)
{
    Log('list-journals', { Query : JSON.stringify(query), Projection : JSON.stringify(proj) })

    const skip = (cond_.Page > 0)? (cond_.Page - 1) * cond_.Limit : 0
        , lmt  = (cond_.Limit > Model.dbset.Limit)? Model.dbset.Limit : cond_.Limit 
        , resp = await db().journals.find(query, proj)
                               .skip(skip)
                               .limit(lmt)
                               .toArray()
    if (!resp.length)
    {
      Log('no-journal-found', { Query : query, Projection : proj })
      return resp
    }
    Log('journals-found', { Journals : JSON.stringify(resp) })
    return resp
}

const Save       = async function(data)
{
    Log('save-journal', { Journal : data })
    const query = { _id    : data._id }
        , act   = { $set   : data     }
        , opt   = { upsert : true     }
    const resp  = await db().journals.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        Log('journal-save-failed', { 
            Query   : query
          , Action  : act
          , Option  : opt
          , Result  : resp.result})

        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.AdditionFailed)
    }
    Log('journal-saved', { Journal : data })
}


const Update       = async function(data)
{
    Log('update-journal', { Feed : data })

    const resp  = await db().journals.updateOne(data.Filter, data.Update)
    if (!resp.acknowledged)
    {
        Log('journal-save-failed', { Feed: data })
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.AdditionFailed)
    }

    Log('journal-updated', JSON.stringify({ Feed: data }))
}

module.exports =
{
    GetByID, Save   
  , Get    , GetMany
  , Find   , Update
}