const { mode } = require("../../../pkg/common/models")

let Customer =
{
    MobileNo  : '+911122334455'
  , Name      : 'Customer'
  , Email     : 'cutomer@cutomer.com'
  , Password  : 'PasswordCustomer'
  , Mode      : mode.User
}

let Seller =
{
    MobileNo  : '+916677889900'
  , Name      : 'Seller'
  , Email     : 'seller@seller.com'
  , Password  : 'PasswordSeller'
  , Mode      : mode.User
}

let Staff =
{
    MobileNo  : '+911133557799'
  , Name      : 'Staff'
  , Email     : 'staff@staff.com'
  , Password  : 'PasswordStaff'
  , Mode      : mode.User
}

let Staff2 =
{
    MobileNo  : '+911133557711'
  , Name      : 'Staff2'
  , Email     : 'staff2@staff2.com'
  , Password  : 'PasswordStaff2'
  , Mode      : mode.User
}

let Agent =
{
    MobileNo  : '+912244668800'
  , Name      : 'Agent'
  , Email     : 'agent@agent.com'
  , Password  : 'PasswordAgent'
  , Mode      : mode.Agent
}

let Admin =
{
    MobileNo  : '+910044008800'
  , Name      : 'Admin'
  , Email     : 'admin@admin.com'
  , Password  : 'PasswordAdmin'
  , Mode      : mode.Admin
}

module.exports =
{
      Customer  : Customer
    , Seller    : Seller
    , Staff     : Staff
    , Staff2    : Staff2
    , Agent     : Agent
    , Admin     : Admin
}