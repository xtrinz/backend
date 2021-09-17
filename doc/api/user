POST /user/register
1. New
body : 
{
    'Task'      : 'New',
    'MobileNo'  : '+91001122334455'
    'Mode'      : 'Admin/Agent/User'
}
2. Read OTP
body :
{
    'Task'      : 'Read_OTP',
    'MobileNo'  : '+91001122334455'
    'OTP'       : '112233'
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
body :
{
    'MobileNo/Email' : '+91001122334455/mail@mail.com'
    'Password'       : '112233'
}

POST /user/passwd/reset
5. Generate OTP
body :
{
    'Task'           : 'Generate_OTP',
    'MobileNo/Email' : '+91001122334455/mail@mail.com'
}
6. Confirm OTP
body :
{
    'Task'           : 'Confirm_OTP',
    'MobileNo/Email' : '+91001122334455/mail@mail.com'
    'OTP'            : '112233'
}
7. Set Password
{
    head : { authorization: 'Bearer <Token>' },
    body :
    {
        'Task'      : 'Set_Password',
        'Password'  : 'password'
    }
}

GET /user/profile
8. Get Profile
head : { authorization: 'Bearer <Token>' }

PUT /user/profile
9. Update Profile
body: 
{
    'Password'    : 'old_password_to_set_new_passwd',
    'NewPassword' : 'new_password',
    'Name'        : 'Modified_Name',
    'Email'       : 'mail@mail.com'
}

Required for All -> { head : { authorization: 'Bearer <Token>' } }