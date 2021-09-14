POST /product/add
1. Add
body : 
{
    'Task'           : 'New',
    'StoreID'        : 'a1234289hundl1281',
    'Name'           : 'product-1',
    'Image'          : 'product-1.img.com',
    'Price'          : 32,
    'Quantity'       : 4,
    'Description'    : 'product-1-red',
    'CategoryID'     : 5
}

GET /product/list
2. List
query :
{
    'StoreID'        : 'a1234289hundl1281'
}

GET /product/view
3. View
body :
{
    'ProductID'      : 'a1234289hundl1281'
}

POST /product/modify
4. Modify
query:
{
    'StoreID'        : 'a1234289hundl1281'
    'Name'           : 'product_1'
    'Image'          : ''
    'Price'          : 33
    'Quantity'       : 6
    'Description'    : 'product-1-red-1'
    'CategoryID'     : 5
    'Variants'       :
    {
        'Id'         : 'a1234289hundl1212',
        'Type'       : 'COLOR'
    }
}

DELETE /product/remove
5. Remove
body :
{
    'StoreID'        : 'a1234289hundl1281',
    'ProductID'      : 'a1234289hundl1281'    
}