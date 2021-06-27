POST /transit/user/cancel
1. Cancel
body : 
{
    'TransitID'      : 'a1234289hundl1281'
}

POST /transit/store
2. Reject / Accept
body :
{
    'Task'      : 'Accept'
    'TransitID' : 'a1234289hundl1281'
}

3. Despatch
body :
{
    'Task'      : 'Despatch'
    'OTP'       : 123456
    'TransitID' : 'a1234289hundl1281'
}

POST /transit/agent

4. Reject / Ignore / Accept
body :
{
    'Task'      : 'Accept'
    'TransitID' : 'a1234289hundl1281'
}

5. Complete
body :
{
    'Task'      : 'Despatch'
    'OTP'       : 123456
    'TransitID' : 'a1234289hundl1281'
}

POST /transit/admin

4. Accept / Termiate
body :
{
    'Task'      : 'Accept'
    'TransitID' : 'a1234289hundl1281'
}

5. Assign
body :
{
    'Task'      : 'Assign'
    'MobileNo'  : +911234567890
    'TransitID' : 'a1234289hundl1281'
}