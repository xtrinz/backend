const { Product } = require('../product/data')

let Cart = function(client)
{
  Cart.Count++

  this.ID         = ''
  this.Name       = client
  this.Products   = [] // { ProductID, Name, Image, Price, Quantity } 
  this.Bill       = 
  {               
        Total     : 18.86
      , Transit   : 15.98
      , Tax       :  2.88
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

    Cart.Carts[this.Name] = this
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
    this.Bill.Product      = this.Bill.Product.round()
    this.Bill.Total       -= prod.Price * prod.Quantity
    this.Bill.Total        = this.Bill.Total.round()

    Cart.Carts[this.Name] = this
  }

  Cart.Carts[this.Name] = this
}

Cart.Count = 0
Cart.Carts = {}

module.exports =
{
    Cart  : Cart
}