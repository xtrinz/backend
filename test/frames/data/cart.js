const { Product } = require('./product')

let Cart = function(user)
{
  Cart.Count++
  this.ID           = ''
  this.UserName     = user
  this.Products     = [] // { ProductID, Name, Image, Price, Quantity } 
  this.Bill         = 
  {                 
        Total       : 0
      , TransitCost : 25
      , Tax         : 4.5
      , NetPrice    : 0
  }
  this.Paytm        = 
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
        ProductID : product.ID
      , Name      : product.Name
      , Price     : product.Price
      , Image     : product.Image
      , Available : product.Available
      , Flagged   : product.Flagged
      , CategoryID: product.CategoryID
      , Quantity  : product.Quantity
    }

    this.Products.push(prod)
    this.Bill.Total       += prod.Price * prod.Quantity
    // this.Bill.TransitCost  = 
    // this.Bill.Tax          =     
    this.Bill.NetPrice     = this.Bill.Total 
                           + this.Bill.TransitCost
                           + this.Bill.Tax

    Cart.Carts[this.UserName] = this
  }

  this.RemoveProduct = function(product_)
  {
    let product = Product.Products[product_]
    let prod =
    {
        ProductID : product.ID
      , Name      : product.Name
      , Image     : product.Image
      , Price     : product.Price
      , Quantity  : product.Quantity
    }

    this.Products.pop(prod)
    this.Bill.Total       -= prod.Price * prod.Quantity
    // this.Bill.TransitCost  = 
    // this.Bill.Tax          =     
    this.Bill.NetPrice     = this.Bill.Total 
                           + this.Bill.TransitCost
                           + this.Bill.Tax

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