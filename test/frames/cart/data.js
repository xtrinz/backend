const { Product } = require('../product/data')

let Cart = function(user)
{
  Cart.Count++

  this.ID         = ''
  this.UserName   = user
  this.Products   = [] // { ProductID, Name, Image, Price, Quantity } 
  this.Bill       = 
  {               
        Total     : 14.51
      , Transit   : 12.30
      , Tax       :  2.21
      , Product   : 0
  }
  this.Paytm      = 
  {
      Token       : ''
    , OrderID     : ''
    , MID         : ''
    , CallBackURL : ''
  }

  this.AddProduct = function(product_)
  {
    let product = Product.Products[product_]
    let prod =
    {
        ProductID   : product.ID
      , Name        : product.Name
      , Price       : product.Price
      , Image       : product.Image
      , Available   : product.Available
      , Flagged     : product.Flagged
      , Category    : product.Category
      , Quantity    : product.Quantity
      , CountAtCart : product.Quantity
      , IsAvailable : true
    }

    this.Products.push(prod)
    this.Bill.Product     += prod.Price * prod.Quantity
    this.Bill.Product      = this.Bill.Product.round()
    this.Bill.Total       += prod.Price * prod.Quantity
    this.Bill.Total        = this.Bill.Total.round()

    Cart.Carts[this.UserName] = this
  }

  this.RemoveProduct = function(product_)
  {
    let product = Product.Products[product_]
    let prod =
    {
        ProductID   : product.ID
      , Name        : product.Name
      , Image       : product.Image
      , Price       : product.Price
      , Available   : product.Available
      , Flagged     : product.Flagged    
      , Category    : product.Category        
      , Quantity    : product.Quantity
      , CountAtCart : product.Quantity  
      , IsAvailable : true          
    }

    this.Products.pop(prod)
    this.Bill.Product     -= prod.Price * prod.Quantity
    this.Bill.Total       -= prod.Price * prod.Quantity

    Cart.Carts[this.UserName] = this
  }

  Cart.Carts[this.UserName] = this
}

Cart.Count = 0
Cart.Carts = {}

module.exports =
{
    Cart  : Cart
}