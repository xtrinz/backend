const { Validator } = require('node-input-validator');

const auth_login = function (req, res, next)
{
  const v = new Validator(req.body,
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
  })
  next()
}

