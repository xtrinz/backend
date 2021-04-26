const { code } = require("../../common/error");
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
  getShops,
} = require("../../database/shop/crudshop");
const router = require("express").Router();

// get shops that are associated with the user
router.get("/", async (req, res, next) => {
  try {
    const { user } = req.body;
    const data = await getShops(user);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});
// get all products in a shop
router.get("/:shopinfoid", async (req, res, next) => {
  try {
    const { shopinfoid } = req.params;
    const data = await getAllProductInShop(shopinfoid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});
// get a detatils about a single product inculding variations if any
router.get("/:shopinfoid/:productid", async (req, res, next) => {
  try {
    const { shopinfoid, productid } = req.params;
    const data = await getSingleProductFromShop(shopinfoid, productid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});
// search product by barcode number with specific variation if any
router.get("/searchbyid", async (req, res, next) => {
  try {
    const { shopinfoid, uniqueid } = req.query;
    const data = await getSingleProductByUniqueId(shopinfoid, uniqueid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

// Todo : search by name pending

// check a product with this id already exist or not
router.get("/check/uniqueid", async (req, res, next) => {
  try {
    const { shopinfoid, uniqueid } = req.query;
    await existUniqueidProduct(shopinfoid, uniqueid);
    return res.status(code.OK).json("Success");
  } catch (error) {
    next(error);
  }
});
// add new product
router.post("/add", async (req, res, next) => {
  try {
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
    return res.status(code.OK).json("Products Added Success Fully");
  } catch (error) {
    next(error);
  }
});
// get product details before removing item
router.get("/delete", async (req, res, next) => {
  try {
    const { shopinfoid, uniqueid } = req.query;
    const data = await getProductDataToRemove(shopinfoid, uniqueid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});
// remove some product from the list
router.delete("/delete", async (req, res, next) => {
  try {
    const { productid, uniqueid, remquantity } = req.body;
    await removeProduct(productid, uniqueid, remquantity);
    return res.status(code.OK).json("Item removed success fully");
  } catch (error) {
    next(error);
  }
});
// get product details before updating data
router.get("/edit/:ch", async (req, res, next) => {
  const { ch } = req.params;
  const { shopinfoid, uniqueid } = req.query;
  const data = await getProductDataToUpdate(shopinfoid, uniqueid, ch);
  return res.status(code.OK).json(data);
});
// update unique id
// It will make a bigger head ache if customer add this product to thier cart or
// they are about to order this product. If we change unique id to another value then
// that will generate error for customer. to avaod that
// either we should n't allow shop owner to change barcode id once it is posted
// or we should have a proper algorithm to deal with that
router.post("/edit/uniqueid", async (req, res, next) => {
  try {
    const { olduniqueid, newuniqueid, productid, variation } = req.body;
    await updateUniqueId(olduniqueid, newuniqueid, productid, variation);
    return res.status(code.OK).json("Success fully updated");
  } catch (error) {
    next(error);
  }
});
// update basic details of the product
router.post("/edit/basic", async (req, res, next) => {
  try {
    const {
      productid,
      uniqueid,
      productname,
      productimage,
      productprice,
      variationtype,
      productcolor,
      quantity,
      producttype,
      gstcategory,
      extradiscount,
    } = req.body;
    await updateBasic(
      productid,
      uniqueid,
      productname,
      productimage,
      productprice,
      variationtype,
      productcolor,
      quantity,
      producttype,
      gstcategory,
      extradiscount
    );
    return res.status(code.OK).json("Success fully updated");
  } catch (error) {
    next(error);
  }
});
// update product details and description of the product
router.post("/edit/details", async (req, res, next) => {
  try {
    const {
      productid,
      productdescription,
      productdetails,
      warrentycard,
      keywords,
    } = req.body;
    await updateDetails(
      productid,
      productdescription,
      productdetails,
      warrentycard,
      keywords
    );
    return res.status(code.OK).json("Success fully updated");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
