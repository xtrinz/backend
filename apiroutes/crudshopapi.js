const {
  shopInfoCollection,
  productsCollection,
} = require("../databaseconnections/mongoconnection");
const httpStatusCodes = require("../error/httpstatuscode");
const {
  addProduct,
  getProductDataToRemove,
  removeProduct,
  getProductDataToUpdate,
  updateUniqueId,
  updateBasic,
  updateDetails,
  existUniqueidProduct,
  getAllProductInShop,
  getSingleProductFromShop,
  getSingleProductByUniqueId,
} = require("../retrievedatafromdatabase/crudshop");

const router = require("express").Router();

// get all products in a shop
router.get("/:shopinfoid", async (req, res, next) => {
  const { shopinfoid } = req.params;
  const data = await getAllProductInShop(shopinfoid);
  return res.status(httpStatusCodes.OK).json(data);
});
// get a detatils about a single product inculding variations if any
router.get("/:shopinfoid/:productid", async (req, res, next) => {
  const { shopinfoid, productid } = req.params;
  const data = await getSingleProductFromShop(shopinfoid, productid);
  return res.status(httpStatusCodes.OK).json(data);
});
// search product by barcode number with specific variation if any
router.get("/searchbyid", async (req, res, next) => {
  const { shopinfoid, uniqueid } = req.query;
  const data = await getSingleProductByUniqueId(shopinfoid, uniqueid);
  return res.status(httpStatusCodes.OK).json(data);
});

// Todo : search by name pending

// check a product with this id exist or not
router.get("/check/uniqueid", async (req, res, next) => {
  const { shopinfoid, uniqueid } = req.query;
  await existUniqueidProduct(shopinfoid, uniqueid);
  return res.status(httpStatusCodes.OK).json("Success");
});
// add new product
router.post("/add", async (req, res, next) => {
  const {
    shopinfoid,
    productname,
    producttype,
    productvariations,
    productdescription,
    productdetails,
    gstcategory,
    warrentycard,
    extradiscount,
    keywords,
  } = req.body;
  await addProduct(
    shopinfoid,
    productname,
    producttype,
    productvariations,
    productdescription,
    productdetails,
    gstcategory,
    warrentycard,
    extradiscount,
    keywords
  );
  return res.status(httpStatusCodes.OK).json("Products Added Success Fully");
});
// get product details before removing item
router.get("/delete", async (req, res, next) => {
  const { shopinfoid, uniqueid } = req.query;
  const data = await getProductDataToRemove(shopinfoid, uniqueid);
  return res.status(httpStatusCodes.OK).json(data);
});
// remove some product from the list
router.delete("/delete", async (req, res, next) => {
  const { productid, uniqueid, remquantity, variation } = req.body;
  await removeProduct(productid, uniqueid, remquantity, variation);
  return res.status(httpStatusCodes.OK).json("Item removed success fully");
});
// get product details before updating data
router.get("/edit/:ch", async (req, res, next) => {
  const { ch } = req.params;
  const { shopinfoid, uniqueid } = req.query;
  const data = await getProductDataToUpdate(shopinfoid, uniqueid, ch);
  return res.status(httpStatusCodes.OK).json(data);
});
// update unique id
// It will make a bigger head ache if customer add this product to thier cart or
// they are about to order this product. If we change unique id to another value then
// that will generate error for customer. to avaod that
// either we should n't allow shop owner to change barcode id once it is posted
// or we should have a proper algorithm to deal with that
router.post("/edit/uniqueid", async (req, res, next) => {
  const { olduniqueid, newuniqueid, productid, variation } = req.body;
  await updateUniqueId(olduniqueid, newuniqueid, productid, variation);
  return res.status(httpStatusCodes.OK).json("Success fully updated");
});
// update basic details of the product
router.post("/edit/basic", async (req, res, next) => {
  const {
    productid,
    productname,
    producttype,
    gstcategory,
    warrentycard,
    extradiscount,
    keywords,
  } = req.body;
  await updateBasic(
    productid,
    productname,
    producttype,
    gstcategory,
    warrentycard,
    extradiscount,
    keywords
  );
  return res.status(httpStatusCodes.OK).json("Success fully updated");
});
// update product details and description of the product
router.post("/edit/details", async (req, res, next) => {
  const { productid, productdescription, productdetails } = req.body;
  await updateDetails(productid, productdescription, productdetails);
  return res.status(httpStatusCodes.OK).json("Success fully updated");
});

module.exports = router;
