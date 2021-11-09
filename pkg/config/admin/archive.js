const { admins }    = require('../../system/database')
    , Model         = require('../../system/models')
    , { ObjectId }  = require('mongodb')

const Save       = async function(data)
{
    console.log('save-admin', { Admin: data })
    const query = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }
    const resp  = await admins.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        console.log('admin-save-failed', { Admin: data, Result: resp.result})
        Err_(Model.code.INTERNAL_SERVER, Model.reason.DBAdditionFailed)
    }
    console.log('admin-saved', { Admin : data })
}

const Get = async function(param, qType)
{
    console.log('find-admin', { Param: param, QType: qType} )
    let query_
    switch (qType)
    {
        case Model.query.ByID       : query_ = { _id: ObjectId(param) } ; break;
        case Model.query.ByMobileNo : query_ = { MobileNo: param }      ; break;
        case Model.query.ByMail     : query_ = { Email: param }         ; break;
    }
    let admin = await admins.findOne(query_)
    if (!admin)
    {
        console.log('admin-not-found', { Query : query_ })
        return
    }
    console.log('admin-found', { Admin: admin })
    return admin
}

const Nearby = async function(ln, lt)
{
    ln = ln.loc()
    lt = lt.loc()

    console.log('get-nearest-admin', {Location: [ln, lt]} )
    const proj    = { projection: { _id: 1, Name: 1, SockID: 1, MobileNo: 1 } }
        , query   =
        { 
            Location  :
            {
                $near : { $geometry    : { type: 'Point', coordinates: [ln, lt] } }
            }
            , Mode    : Model.mode.Admin
        }

    const admin_ = await admins.findOne(query, proj)
    if (!admin_)
    {
        console.log('admin-not-found', { Location: [ln, lt]})
        return
    }
    console.log('admin-found', { Admin: admin_ })
    return admin_
}

module.exports =
{
      Save   : Save
    , Get    : Get
    , Nearby : Nearby
}