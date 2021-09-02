const router 	               = require('express').Router()
    , { code, text, status } = require('../../common/error')
    , { task }               = require('../../common/models')
    , { Store }              = require('../store/driver')

router.post('/register', async (req, res, next) =>
{
  try
  {
    console.log('register-shop',req.body)
    let text_, data_ = {}, store

    switch(req.body.Task)
    {
        case task.New:
            store = new Store(req.body)
            await store.New(req.body)
            text_ = text.OTPSendToMobileNo.format(
                    store.Data.MobileNo.slice(-4))
            break

        case task.ReadOTP:
            store = new Store()
            const token = await store.ConfirmMobileNo(req.body)
            text_ = text.OTPConfirmed
            data_ = { Token : token }
            break
            
        case task.Approve:
            store  = new Store()
            await store.Approve(req.body)
            text_ = text.Approved
            break
    }
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text_,
      Data    : data_
    })
  } catch (err) { next(err) }
})

router.get('/view', async (req, res, next) => {
    try 
    {
      let  store  = new Store()
      const id_   = req.query.StoreID
          , mode_ = req.body.Mode
          , data  = await store.Read(id_, mode_)

      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

router.get('/list', async (req, res, next) =>
{
    try 
    {
      const store = new Store()
          , data  = await store.List(req.query, req.body.Mode)
      
      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

router.put('/edit', async (req, res, next) =>
{
  try 
  {
    let  store = new Store()
    // TODO await store.Edit(req.body)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProfileUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router