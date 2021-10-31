const { ObjectId }  = require('mongodb')
    , { stores }    = require('../../system/database')
    , {   Err_
        , code
        , reason
        , query
        , dbset
        , states
        , limits }  = require('../../system/models')

const Save       = async function(data)
{
    console.log('save-store', data)
    const query = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }

    const resp  = await stores.updateOne(query, act, opt)
    if (!resp.result.ok)
    {
        console.log('store-save-failed',
        { 
              Query     : query
            , Action    : act
            , Option    : opt
            , Result    : resp.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('store-saved', { Store : data })
}

const Get = async function(param, qType)
{
    console.log('find-store', { Param: param, QType: qType})
    let query_
    switch (qType)
    {
        case query.ByID   : query_ = { _id: ObjectId(param) } ; break;
        case query.Custom : query_ = param                    ; break;
    }
    let store = await stores.findOne(query_)
    if (!store)
    {
        console.log('store-not-found', {Query : query_, Type: qType })
        return
    }
    console.log('store-found', { Sotre: store })
    return store
}

const List = async function(data, proj)
{
    data.Limit  = data.Limit.loc()
    data.Page   = data.Page.loc()
    const query = data.Query
        , skip  = (data.Page > 0)? (data.Page - 1) * data.Limit : 0
        , lmt   = (data.Limit > dbset.Limit)? dbset.Limit : data.Limit

    const data_ = await stores.find(query, proj)
                              .skip(skip)
                              .limit(lmt)
                              .toArray()
    if (!data_.length && data.Page === 1)
    {
        console.log('no-near-by-stores', { Query : query })
        return data_
    }

    console.log('near-by-stores', { Stores: data_ })
    return data_
}

const GetStoreSockID = async function(store_id)
{
    console.log('get-store-sock-id', { StoreID: store_id })

    const query = { _id: ObjectId(store_id), IsLive: true }

    let store = await stores.findOne(query)
    if(!store)
    {
        console.log('store-not-found', query)
        return []
    }
    console.log('store-found', { User : store })
    return store.SockID
}

const Seller = async function(store_id)
{
    const store   = await Get(store_id, query.ByID)
    if (!store) Err_(code.BAD_REQUEST, reason.StoreNotFound)

    const now_     = new Date()
        , is_now   = now_.is_now(store.Time.Open, store.Time.Close)
        , is_today = now_.is_today(store.Status.SetOn)        
    if( !is_now || (is_today && store.Status === states.Closed) ||
      ( is_now && now_.diff_in_m(store.Time.Close) < limits.CheckoutGracePeriod))
    {
      let reason_ = (is_now)? reason.GracePeriodExceeded: reason.StoreClosed
      console.log('store-has-closed', { Store: store })
      Err_(code.BAD_REQUEST, reason_)
    }

    const resp = 
    {                 
        ID        : store._id
      , Name      : store.Name
      , MobileNo  : store.MobileNo
      , Image     : store.Image
      , Address   : store.Address
    }
    resp.Address.Longitude = store.Address.Location.coordinates[0].toFixed(6)
    resp.Address.Latitude  = store.Address.Location.coordinates[1].toFixed(6)
    delete resp.Address.Location
    console.log('the-seller', { Seller : resp })
    return resp
}

const Location = async function(store_id)
{
    console.log('get-store-location', { StoreID: store_id })

    store_ = await Get(store_id, query.ByID)
    if (!store_) Err_(code.BAD_REQUEST, reason.StoreNotFound)
    let data =
    {
        Longitude : store_.Address.Location.coordinates[0].toFixed(6)
      , Latitude  : store_.Address.Location.coordinates[1].toFixed(6)
    }

    console.log('store-location-found', { StoreID: store_id, Loc : data })
    return data
}

module.exports =
{
      Save           : Save
    , Get            : Get
    , List           : List
    , GetStoreSockID : GetStoreSockID
    , Seller         : Seller
    , Location       : Location
}