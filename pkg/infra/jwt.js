const jwt                     = require('jsonwebtoken')
    , jwt_secret              = process.env.JWT_KEY
    , { Err_, code, reason }  = require('../common/error')

    , Sign       = async function(data)
    {
        const token = 'Bearer ' + await jwt.sign(data, jwt_secret)
        return token
    }
    , Verify     = async function(token)
    {
        if (!token) Err_(code.BAD_REQUEST, reason.TokenMissing)

        token       = token.slice(7) // cut 'Bearer <token>'
        const res = await jwt.verify(token, jwt_secret)

        if (!res || !res._id || !res.Mode) 
        Err_(code.BAD_REQUEST, reason.InvalidToken)
        return res
    }

module.exports = 
{
      Sign   : Sign
    , Verify : Verify
}
