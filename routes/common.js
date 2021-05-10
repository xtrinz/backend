const { Store }              = require("../objects/store")
    , router                 = require("express").Router()
    , { text, code, status } = require("../common/error") 

router.get("/feed", async (req, res, next) => {
  try
  {
    let text_
    const data = req.query // Lattitude & Longitude should be taken from user record
    const   PageNo  = parseInt(data.PageNo)
          , Lon     = parseFloat(data.Longitude)
          , Lat     = parseFloat(data.Lattitude)
          , stores_ = new Store()
          , data    = await stores_.ListNearby(PageNo, Lon, Lat)

    if(!data.length && PageNo === 1) 
    { text_ = text.NoDataFound}

    return res.status(code.OK).json({
        Status  : status.Success,
        Text    : text_,
        Data    : data
      })
  } catch (err) { next(err) }
})

router.get("/search", async (req, res, next) => {
  try
  {
    let text_
    const data_ = []
    if(!data_.length) { text_ = text.NoDataFound}

    return res.status(code.OK).json({
        Status  : status.Success,
        Text    : text_,
        Data    : data_
      })
  } catch (err) { next(err) }
})

module.exports = router