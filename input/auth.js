const niv = require('./common')

const auth_login = function (req, res, next)
{
  const v = new niv.Validator(req.body,
  {
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

const auth_reset_pass = function (req, res, next)
{
  const v = new niv.Validator(req.body,
  {
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

const auth_test_otp = function (req, res, next)
{
  const v = new niv.Validator(req.body,
  {
    phonenumber: ['required', 'regex:^+91[0-9]{10}$'],
    email: 'email',
    otp: 'required|string'
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

const auth_update_passwd = function (req, res, next)
{
  const v = new niv.Validator(req.body,
  {
    phonenumber: ['required', 'regex:^+91[0-9]{10}$'],
    email: 'email',
    password: 'required'
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
  Login     : auth_login,
  ResetPass : auth_reset_pass,
  CheckOTP  : auth_test_otp,
  UpdatePass: auth_update_passwd
}