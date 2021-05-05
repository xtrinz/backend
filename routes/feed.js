const express           = require("express");
const { code, status }  = require("../../common/error");
const { text } = require("../common/error");
const { Store }         = require("../database/store");
const { User }          = require("../database/user")
const router            = express.Router()

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

module.exports = router