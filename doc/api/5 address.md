POST /address/add
1. Add
body : 
{
    'Longitude'      : 17.2,
    'Latitude'       : 17.2,
    'Tag'            : 'HOME',
    'IsDefault'      : false,
    'Address'        :
    {
        'Line1'      : 'Line1',
        'Line2'      : 'Line2',
        'City'       : 'City',
        'PostalCode' : 123456,
        'State'      : 'State',
        'Country'    : 'Country'
    }
}

GET /address/list
2. List
query : {}

GET /address/view
3. View
query :
{
    'AddressID'      : 'a1234289hundl1281'
}

POST /address/modify
4. Modify
query:
{
    'AddressID'      : 'a1234289hundl1281',
    'Longitude'      : 17.2,
    'Latitude'       : 17.2,
    'Tag'            : 'HOME',
    'IsDefault'      : false,
    'Address'        :
    {
        'Line1'      : 'Line1',
        'Line2'      : 'Line2',
        'City'       : 'City',
        'PostalCode' : 123456,
        'State'      : 'State',
        'Country'    : 'Country'
    }
}

DELETE /address/remove
5. Remove
body :
{
    'AddressID'      : 'a1234289hundl1281'
}