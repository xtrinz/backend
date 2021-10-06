const router        = require('express').Router()
    , { text
    ,   code
    ,   search
    ,   status }    = require('../../system/models')
    , { Journal }   = require('../journal/driver')


router.get('/search', async (req, res, next) => {
  try
  {
    let text_, query_
    const data_ = []
/*
    body = 
    {
        Type      : 'Store/Product'
      , Stores    : [ 'Location This will be a filed', 'Category Can be a filed', 'Name Category' ]
      , Products  : [ 'Location This will be a filed ? Have to think about this'
                      , 'StoreID'
                      , 'Category Is a filed', 'Name Category' ]
    }

    switch(req.body.Type)
    {
      case search.Store  :
        query_ =
        {
          
        }
        break
      case search.Product:
        break
    }
*/
    if(!data_.length) { text_ = text.NoDataFound}

    return res.status(code.OK).json({
        Status  : status.Success,
        Text    : text_,
        Data    : data_
      })
  } catch (err) { next(err) }
})

router.post('/checkout', async (req, res, next) =>
{
  try
  {

    const journal = new Journal() 
        , data    = await journal.New(req.body)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.PaymentInitiated,
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router