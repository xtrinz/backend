const { users }                     = require("../connect")
const { Err, code, status, reason } = require("../../common/error")

function Address(data)
{
    this._id        = ''
    this.Location   =
    {
          Type          : 'Point'
        , Coordinates   : [data.Longitude, data.Latitude]
    }
    this.State      = states.New
    this.Tag        = data.Tag
    this.IsDefault  = data.IsDefault

    this.Address    =
    {
          Name          : data.Name
        , Line1         : data.Line1
        , Line2         : data.Line2
        , City          : data.City
        , PostalCode    : data.PostalCode
        , State         : data.State
        , Country       : data.Country
    }

    this.Insert     = function (user_id)
    {
        this._id    = new ObjectID()
        const query = { _id: user_id }
            , opts  = { $push: { AddressList: this } }

        const resp  = await users.updateOne(query, opts)
        if (resp.modifiedCount !== 1) 
        {
            console.log('address-insertion-failed', this)
            throw new Err(code.INTERNAL_SERVER,
                            status.Failed,
                            reason.DBInsertionFailed)
        }
        console.log('address-inserted', query, opts)
    }
/*
    this.Update     = function (user_id, entry_id)
    {
        const   query = { _id: user_id, 'AddressList._id': entry_id }
              , opts  = { $set: { 'AddressList.$.Qnty': qnty }      }

        const resp  = await users.updateOne(query, opts)
        if (resp.modifiedCount !== 1) 
        {
            console.log('address-update-failed', this)
            throw new Err(code.INTERNAL_SERVER,
                            status.Failed,
                            reason.DBUpdationFailed)
        }
        console.log('address-updated', query, opts)
    }
*/
    this.Remove     = function (user_id, entry_id)
    {
        const   query = { _id: user_id }
                , opts  = { $pull: { AddressList: {_id: entry_id} } }

        const resp  = await users.updateOne(query, opts)
        if (resp.modifiedCount !== 1) 
        {
            console.log('address-removal-failed', this)
            throw new Err(code.INTERNAL_SERVER,
                            status.Failed,
                            reason.DBRemovalFailed)
        }
        console.log('address-removed', query, opts)
    }
}

module.exports = 
{
    Address : Address
}