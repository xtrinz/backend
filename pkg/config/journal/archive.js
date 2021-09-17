const { ObjectId }                  = require('mongodb')
    , { Err_, code, reason, dbset } = require('../../system/models')
    , { journals }                  = require('../../system/database')

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

const Get    = async function(query, proj)
{
    console.log('find-journal-by-custom-query', { Query : query, Projection : proj })

    const journal = await journals.findOne(query, proj)
    if (!journal)
    {
      console.log('journal-not-found-by-custom-query', { Query : query, Projection : proj })
      Err_(code.INTERNAL_SERVER, reason.JournalNotFound)
    }
    console.log('journal-found-by-custom-query', { Journal : journal })
    return journal
}

const GetMany    = async function(query, proj, cond_)
{
    console.log('list-journals', { Query : query, Projection : proj })

    const skip = (cond_.Page > 0)? (cond_.Page - 1) * cond_.Limit : 0
        , lmt  = (cond_.Limit > dbset.Limit)? dbset.Limit : cond_.Limit 
        , resp = await journals.find(query, proj)
                               .skip(skip)
                               .limit(lmt)
                               .toArray()
    if (!resp)
    {
      console.log('no-journal-found', { Query : query, Projection : proj })
      Err_(code.INTERNAL_SERVER, reason.JournalNotFound)
    }
    console.log('journals-found', { Journals : resp })
    return resp
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

module.exports =
{
    GetByID : GetByID
  , Save    : Save
  , Get     : Get
  , GetMany : GetMany
}