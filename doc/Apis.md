USER
----

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
STORE
-----
POST /store/register
10. New Store
body : 
{
    'Task'           : 'New',
    'Email'          : '+91001122334455',
    'Image'          : 'https://img.img',
    'Certs'          : ['https://cert.img.com'],
    'Type'           : 'Electronics',
    'Name'           : 'store1',
    'MobileNo'       : '+91001122334455',
    'Longitude'      : 12.23,
    'Latitude'       : 12.23,
    'Address'        :
    {
        'Line1'      : 'Line1',
        'Line2'      : 'Line2',
        'City'       : 'City',
        'PostalCode' : 670182,
        'State'      : 'Kerala',
        'Country'    : 'India'
    }
}

12. Read OTP
body :
{
    'Task'      : 'Read_OTP',
    'MobileNo'  : '+91001122334455',
    'OTP'       : 112233
}

13. Approve
body :
{
    'Task'      : 'Approve',
    'StoreID'   : 'a1234289hundl1281'
}

GET /store/view
14. View
query:
{
    'StoreID'   : 'a1234289hundl1281'
}

GET /store/list
15. List
{} // Token is enough

POST /store/staff
16. Request By Owner
body :
{
    'Task'      : 'Request',
    'StoreID'   : 'a1234289hundl1281',
    'MobieNo'   : 'No_of_staff'
}
17. Accept/Deny By Staff
body :
{
    'Task'      : 'Accept/Deny',
    'StoreID'   : 'a1234289hundl1281'
}
18. Request Revoke By Owner
body :
{
    'Task'     : 'Revoke',
    'StoreID'  : 'a1234289hundl1281',
    'MobileNo' : 'No_of_staff'
}
19. Relieve By Owner
body :
{
    'Task'      : 'Relieve',
    'StoreID'   : 'a1234289hundl1281',
    'MobieNo'   : 'No_of_staff'
}

GET /store/staff
20. List staff
body :
{
    'StoreID'   : 'a1234289hundl1281',
}

PRODUCT
-------
