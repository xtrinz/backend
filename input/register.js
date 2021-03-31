const niv = require('./common')

const register = function (req, res, next)
{
  const v = new niv.Validator(req.body,
  {
    phonenumber: ['required', 'regex:^+91[0-9]{10}$'],
    password: 'required|string'
  })

  v.check()
  .then((matched) => 
  {
    if (!matched)
    {
    	return res.status(422).send(v.errors)
    }
    next()
  })
}

const register_test_mobno = function (req, res, next)
{
  const v = new niv.Validator(req.body,
  {
    phonenumber: ['required', 'regex:^+91[0-9]{10}$'],
    otp: 'required'
  })

  v.check()
  .then((matched) => 
  {
    if (!matched)
    {
      return res.status(422).send(v.errors)
    }
    next()
  })
}

const register_user = function (req, res, next)
{
  const v = new niv.Validator(req.body,
  {
    firstname: 'required|string',
    lastname: 'required|string',
    password: 'required',
    phonenumber: ['required', 'regex:^+91[0-9]{10}$'],
    email: 'email'
  })

  v.check()
  .then((matched) => 
  {
    if (!matched)
    {
      return res.status(422).send(v.errors)
    }
    next()
  })
}

module.exports =
{
  Reg   : register,
  MobNo : register_test_mobno,
  User  : register_user
}