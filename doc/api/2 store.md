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