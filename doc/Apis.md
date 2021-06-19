POST /user/register
1. New
{
    body : 
    {
        'Task'      : 'New',
        'MobileNo'  : '+91001122334455'
        'Mode'      : 'Admin/Agent/User'
    }
}
2. Read OTP
{
    body :
    {
        'Task'      : 'Read_OTP',
        'MobileNo'  : '+91001122334455'
        'OTP'       : '112233'
    }
}
3. Register
{
    head : { authorization: 'Bearer <Token>' },
    body :
    {
        'Task'      : 'Register',
        'Name'      : 'TheUser',
        'Password'  : 'password',
        'Email'     : 'mail@mail.com'
    }
}

POST /user/login
4. Login
{
    body :
    {
        'MobileNo/Email' : '+91001122334455/mail@mail.com'
        'Password'       : '112233'
    }
}

