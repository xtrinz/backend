const { notes }              = require('../../system/database')
    , { Err_, code, reason } = require('../../system/models')

const Get    = async function(type)
{
    let query = { Type: type }
    console.log('find-note', { Query : query })

    const note = await notes.findOne(query)
    if (!note)
    {
      console.log('note-not-found', { Query : query })
      Err_(code.INTERNAL_SERVER, reason.NoteNotFound)
    }
    console.log('note-found', { Note : note })
    return note
}

const Save       = async function(data)
{
    console.log('save-note', { Note : data })
    const query = { Type   : data.Type }
        , act   = { $set   : data      }
        , opt   = { upsert : true      }
    const resp  = await notes.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        console.log('note-save-failed', { 
            Query   : query
          , Action  : act
          , Option  : opt
          , Result  : resp.result})

        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('note-saved', { Note : data })
}

module.exports =
{
      Get   : Get
    , Save  : Save
}