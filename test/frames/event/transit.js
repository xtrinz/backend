const { Method, Type, Rest }  = require("../../lib/medium")
    , { prints }              = require("../../lib/driver")
    , jwt                     = require("../../../pkg/common/jwt")
    , { code, status }        = require("../../../pkg/common/error")
    , { alerts, task }        = require("../../../pkg/common/models")

let StoreAccept = function(addr)
{
  this.Data =
  {
      Type                : Type.Rest
    , Describe            : 'Transit Store Accept'
    , Request             :
    {
          Method          : Method.POST
        , Path            : '/transit/store'
        , Body            : 
        {
              StoreID     : ''
            , TransitID   : ''
            , Task        : task.Accept
        }
        , Header          : { Authorization: '' }
    }
    , Response            :
    {
          Code            : code.OK
        , Status          : status.Success
        , Text            : alerts.Accepted
        , Data            : {}
    }
  }

  this.PreSet        = async function(data)
  {
    console.log(prints.ReadParam)
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    data.Request.Body.StoreID   = resp.Data.StoreID
    data.Request.Body.TransitID = resp.Data.TransitID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

module.exports =
{
    StoreAccept
}