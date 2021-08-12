let Journal = function()
{
  Journal.Count++

  this.ID           = ''
  this.StoreID      = ''
  this.Name         = 'Journal{0}'.format(Journal.Count)
  this.Image        = 'image.{0}.com'.format(this.Name.toLowerCase())
  this.Price        = Journal.Count * 10
  this.Quantity     = Journal.Count * 2
  this.Available    = Journal.Count * 2
  this.Flagged      = false
  this.Description  = '{0} Description'.format(this.Name)

  Journal.Products[this.Name] = this
}

Journal.Count      = 0
Journal.Products   = {}

module.exports =
{
    Journal  : Journal
}