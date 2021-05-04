const express           = require("express");
const { code, status }  = require("../../common/error");
const { text } = require("../common/error");
const { Store }         = require("../database/store");
const router            = express.Router()

router.get("/feed", async (req, res, next) => {
  try
  {
    let text_
    const data = req.query
    const   PageNo  = parseInt(data.PageNo)
          , Lon     = parseFloat(data.Longitude)
          , Lat     = parseFloat(data.Lattitude)
          , stores_ = new Store()
          , data    = await stores_.GetNearbyList(PageNo, Lon, Lat)

    if(!data.length && PageNo === 1) 
    { text_ = text.NoDataFound}

    return res.status(code.OK).json({
        Status  : status.Success,
        Text    : text_,
        Data    : data
      })
  } catch (err) { next(err) }
})

module.exports = router