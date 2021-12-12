require('../../../cmd/settings')

const mongoose  = require("mongoose");

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true })

const Schema1  = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId
    , Model    = require('../../system/models')
    
const Schema = new Schema1 ({

    MobileNo      : { type : String          , index : false            }
  , Name          : { type : String          , index : false            }
  , Otp           : { type : String          , index : false            }
  , Mode          : { type : String          , index : false            }
  , State         : { type : String          , index : false            }
  , Event         : { type : String          , index : false            }
  , Name          : { type : String          , index : false            }
  , SockID        : { type: [ Number ] }
  , Location      : { type : { type:String } , coordinates : { type: [ Number ] } }
  , IsLive        : { type : Boolean         , index       : false      }

})

//Schema.index({ Location : '2dsphere' })
const Sketch = mongoose.model('Admin', Schema)

const Save       = async function(data)
{
    const query = { _id    : data._id         }
        , act   = { $set   : data             }
        , opt   = { upsert : true             }

/*    let k = new Sketch(data)
    
    Log('save-admin', { k })

    await k.save()
*/
    const resp = await Sketch.findOneAndUpdate(query, act, opt)
    if (!resp)
    {
        Log('admin-save-failed', { Admin: data, Result: resp })
        //Err_(Model.code.INTERNAL_SERVER, Model.reason.DBAdditionFailed)
    }
    Log('admin-saved', { Admin : data })
}

let data =  { _id : ObjectId('61b182ab8ac764b7881bd725') } // new ObjectId()
Log('admin-save', { data })
Save(data)