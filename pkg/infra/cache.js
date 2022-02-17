const { ObjectId } = require('mongodb')

var socket_fwd = new Map()
var socket_bwd = new Map()

let SetID = function(_id, mode_, sock_id)
{
    let key = 
    {
          _id   : String(_id)
        , Mode  : mode_
    }

    key = JSON.stringify(key)

    let lst
    if(socket_fwd.has(key)) lst = socket_fwd.get(key) 
                       else lst = []

    lst.push(sock_id)
    socket_fwd.set(key, lst)

    socket_bwd.set(sock_id, key)

    console.log('set-live-endponts', socket_bwd, socket_fwd)
}

let GetByRoleID = function(_id, mode_)
{

    console.log('list-live-endponts', socket_bwd, socket_fwd)

    let key = 
    {
          _id  : String(_id)
        , Mode : mode_
    }
    key = JSON.stringify(key)
    let lst
    if(socket_fwd.has(key)) lst = socket_fwd.get(key) 
                       else lst = []
    return lst
}

let GetBySockID = function(sock_id)
{
    let key = socket_bwd.get(sock_id)
    key = JSON.parse(key)
    return key
}

let RemoveID = function(_id, mode_, sock_id)
{
    let key   = 
    {
        _id   : String(_id)
      , Mode  : mode_
    }
    key = JSON.stringify(key)
    if(socket_fwd.has(key))
    {
        let lst = socket_fwd.get(key)

        let idx = socket_fwd.get(sock_id)
        if (idx > -1) lst.splice(idx, 1)

        if(lst.length) socket_fwd.set(key, lst)
        else           socket_fwd.delete(key)

        socket_bwd.delete(sock_id)
    }
}

var accounts = new Map()

let SetAcc = function (acc_ , id_) 
{ 
    id_ = String(id_)
    accounts.set(acc_, id_)   
}

let GetAcc = function (acc_)       
{ 
    let ret = accounts.get(acc_)
        ret = ObjectId(ret)
    return ret 
}

module.exports = 
{ 
      SetID, GetByRoleID
    , GetBySockID, RemoveID
    , SetAcc, GetAcc 
}