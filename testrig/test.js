require("dotenv").config()
const { compareSync } 	= require("bcryptjs");
const express       	= require("express")
const app           	= express()
const { ObjectId } 	= require("mongodb")
const jwt 		= require("jsonwebtoken")
const jwt_secret        = process.env.JWT_AUTHORIZATION_TOKEN_SECRET
const { sockets }   	= require("../objects/connect");

//app.post('/', async (req, res) =>
app.get('/', async (req, res) =>
{
    console.log('hit')
    let opts = function() 
    {
        this._id = ObjectId('608924a0051de619b651caab'),
        this.Kol = 'u'
        this.Loc = { type: "Point", coordinates: [10, 10] }
        this.hi = function() { this.Kol = 'k' }
        this.save = async function()
        {
      //      let x = await sockets.updateOne({ _id: this._id }, { $set: this}, { upsert : true })
            console.log(x.matchedCount)
        }
    }
    const o = new opts()
    o.hi()
    //console.log(o)
    //o.save()  
    const tu = await sockets.find({Kol: 'k'}, {})  
    console.log(tu.save())

})

app.listen(3001, () => { console.log("Server Running On Port 3001") })
