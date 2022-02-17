const { ObjectId } = require('mongodb')
    , { db }       = require('../../../sys/database')
    , Model        = require('../../../sys/models')
    , Log          = require('../../../sys/log')

const Save       = async function(data)
{
    Log('save-seller', data)
    const query = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }

    const resp  = await db().sellers.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        Log('seller-save-failed',
        { 
              Query     : query
            , Action    : act
            , Option    : opt
            , Result    : resp.result
        })
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.AdditionFailed)
    }
    Log('seller-saved', { Seller : data })
}

const Get = async function(param, qType)
{
    Log('find-seller', { Param: param, QType: qType})
    let query_
    switch (qType)
    {
        case Model.query.ByID   : query_ = { _id: ObjectId(param) } ; break;
        case Model.query.ByMobileNo : query_ = { MobileNo: param }  ; break;        
        case Model.query.Custom : query_ = param                    ; break;
    }
    let seller = await db().sellers.findOne(query_)
    if (!seller)
    {
        Log('seller-not-found', {Query : query_, Type: qType })
        return
    }
    Log('seller-found', { Sotre: seller })
    return seller
}

const List = async function(data, proj)
{
    data.Limit  = data.Limit.loc()
    data.Page   = data.Page.loc()
    const query = data.Query
        , skip  = (data.Page > 0)? (data.Page - 1) * data.Limit : 0
        , lmt   = (data.Limit > Model.dbset.Limit)? Model.dbset.Limit : data.Limit

    const data_ = await db().sellers.find(query, proj)
                              .skip(skip)
                              .limit(lmt)
                              .toArray()
    if (!data_.length && data.Page === 1)
    {
        Log('no-near-by-sellers', { Query : JSON.stringify(query) })
        return data_
    }

    Log('near-by-sellers', { Sellers: data_ })
    return data_
}

const Location = async function(seller_id)
{
    Log('get-seller-location', { SellerID: seller_id })

    seller_ = await Get(seller_id, Model.query.ByID)
    if (!seller_) Model.Err_(Model.code.BAD_REQUEST, Model.reason.SellerNotFound)
    let data =
    {
        Longitude : seller_.Address.Location.coordinates[0].toFixed(6)
      , Latitude  : seller_.Address.Location.coordinates[1].toFixed(6)
    }

    Log('seller-location-found', { SellerID: seller_id, Loc : data })
    return data
}

module.exports =
{
      Save , Get    
    , List , Location   
}