let Product = function()
{
  Product.Count++

  this.ID            = ''
  this.StoreID       = ''
  this.Name          = 'Product{0}'.format(Product.Count)
  this.Image         = 'image.{0}.com'.format(this.Name.toLowerCase())
  this.Price         = Product.Count * 10
  this.Quantity      = Product.Count * 2
  this.Available     = Product.Count * 2
  this.Flagged       = false
  this.Description   = '{0} Description'.format(this.Name)
  this.Category      = 'Electronics'
  this.VolumeBase    = 30
  this.Unit          = 'kg'
  this.HasCOD        = true
  this.Variants      =
  {
        Type    : 'COLOR'
  }

  Product.Products[this.Name] = this
}

Product.Count      = 0
Product.Products   = {}

module.exports =
{
    Product  : Product
}