const { ObjectId } = require('mongodb')
    , Model        = require('../../../sys/models')
    , db           = require('../../exports')[Model.segment.db]
    , Log          = require('../../../sys/log')

const Insert = async function(addrs)
{
    Log('insert-address', { Address: addrs })

    if(addrs.IsDefault)
    await db.address.ResetDefault(addrs.ClientID)

    await db.address.Insert(addrs)

    return addrs._id
}

const Read = async function(data)
{
    Log('read-address', data)
    const addr = await db.address.Read(data.ClientID, data.AddressID)
    return addr
}

const List = async function(client_id)
{
    Log('list-address', { ClientID : client_id })
    const list = await db.address.List(client_id)
    return list
}

const Update = async function(data)
{
    Log('update-address', { Address : data })

    const client_id = data.Client._id
    delete data.Client

    if(data.IsDefault) await db.address.ResetDefault(client_id)

    data._id  = ObjectId(data.AddressID)
    delete data.AddressID

    await db.address.Update(client_id, data)
}

const Remove = async function(client_id, addr_id)
{
    Log('remove-address',
    {
            ClientID  : client_id
        , AddressID : addr_id
    })

    await db.address.Remove(client_id, addr_id)
}

module.exports = 
{
      Insert  , Read
    , List    , Update
    , Remove
}