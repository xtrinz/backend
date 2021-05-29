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

let Agent =
{
    MobileNo  : '+912244668800'
  , Name      : 'Agent'
  , Email     : 'agent@agent.com'
  , Password  : 'PasswordAgent'
  , Mode      : mode.Agent
}

module.exports =
{
      Customer  : Customer
    , Seller    : Seller
    , Staff     : Staff
    , Agent     : Agent
}