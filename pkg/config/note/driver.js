const { ObjectID } = require('mongodb')
    , Model        = require('../../system/models')
    , db           = require('../exports')[Model.segment.db]

class Note
{
    constructor(data)
    {
        this._id          = new ObjectID()
        this.Type         = data.Type
        this.Body         = data.Body
    }

    static async Read(type)
    {
        console.log('read-note', { Type: type })
        const note = await db.note.Get(type)
        delete note._id
        return note
    }

    static async Set(data)
    {
        console.log('update-note', { Note : data })

        let note =
        {
              Type : data.Type
            , Body : data.Body
        }

        await db.note.Save(note)
    }
}

module.exports = 
{
    Note : Note
}