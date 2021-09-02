const jwt        = require('jsonwebtoken')
    , jwt_secret = process.env.JWT_AUTH_TOKEN

    , Sign       = async function(data)
    {
        const token = await jwt.sign(data, jwt_secret)
        return token
    }
    , Verify     = async function(token)
    {
        if (!token) Err_(code.BAD_REQUEST, reason.TokenMissing)

        token       = token.slice(7) // cut 'Bearer <token>'
        const res = await jwt.verify(token, jwt_secret)

        if (!res || !res._id || !res.Mode) 
        Err_(code.BAD_REQUEST, reason.UserNotFound)
        return res
    }

module.exports = 
{
      Sign   : Sign
    , Verify : Verify
}
