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
} = require("../retrievedatafromdatabase/crudshop");

const router = require("express").Router();

router.post("/add", async (req, res, next) => {
  const {
    shopinfoid,
    productname,
    producttype,
    productvariations,
    productdescription,
    productdetails,
    uniqueid,
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
    uniqueid,
    gstcategory,
    warrentycard,
    extradiscount,
    keywords
  );
  return res.status(httpStatusCodes.OK).json("Products Added Success Fully");
});

// get details of product that already exist in database. so that when different
//shop try to add products that are already exist in database then they can use that data and edit on that data
//router.get("/");

router.get("/delete", async (req, res, next) => {
  const { shopinfoid, uniqueid } = req.query;
  const data = await getProductDataToRemove(shopinfoid, uniqueid);
  return res.status(httpStatusCodes.OK).json(data);
});

router.delete("/delete", async (req, res, next) => {
  const { productid, uniqueid, remquantity, variation } = req.body;
  await removeProduct(productid, uniqueid, remquantity, variation);
  return res.status(httpStatusCodes.OK).json("Item removed success fully");
});

router.get("/edit/:ch", async (req, res, next) => {
  const { ch } = req.params;
  const { shopinfoid, uniqueid } = req.query;
  const data = await getProductDataToUpdate(shopinfoid, uniqueid, ch);
  return res.status(httpStatusCodes.OK).json(data);
});

router.post("/edit/uniqueid", async (req, res, next) => {
  const { olduniqueid, newuniqueid, productid, variation } = req.body;
  await updateUniqueId(olduniqueid, newuniqueid, productid, variation);
  return res.status(httpStatusCodes.OK).json("Success fully updated");
});

router.post("/edit/basic", async (req, res, next) => {
  const {
    productid,
    variation,
    productname,
    producttype,
    uniqueid,
    gstcategory,
    warrentycard,
    extradiscount,
    keywords,
  } = req.body;
});

module.exports = router;
