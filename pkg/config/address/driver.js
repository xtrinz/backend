const { ObjectId } = require('mongodb')
    , Model        = require('../../system/models')
    , db           = require('../exports')[Model.segment.db]

const Insert = async function(user_id, len, addrs)
{
    console.log('insert-address', { Address: addrs })

    if(len > Model.limits.AddressCount)
    {
        console.log('address-max-count-exceeded', { UserID: user_id, addr: addrs })
        Err_(code.INTERNAL_SERVER, reason.AddressLimitExceeded)
    }

    if(addrs.IsDefault) await db.address.ResetDefault(user_id)

    await db.address.Insert(user_id, addrs)

    return addrs._id
}

const Read = async function(data)
{
    console.log('read-address', data)
    const addr = await db.address.Read(data.UserID, data.AddressID)
    return addr
}

const List = async function(user_id)
{
    console.log('list-address', { UserID : user_id })
    const list = await db.address.List(user_id)
    return list
}

const Update = async function(data)
{
    console.log('update-address', { Address : data })

    const user_id = data.User._id
    delete data.User

    if(data.IsDefault) await db.address.ResetDefault(user_id)

    data._id  = ObjectId(data.AddressID)
    delete data.AddressID

    await db.address.Update(user_id, data)
}

const Remove = async function(user_id, addr_id)
{
    console.log('remove-address',
    {
            UserID  : user_id
        , AddressID : addr_id
    })

    await db.address.Remove(user_id, addr_id)
}

module.exports = 
{
      Insert  , Read
    , List    , Update
    , Remove
}