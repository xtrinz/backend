const {
  addEmployee,
  acceptedEmployee,
  rejectedEmployee,
  removeEmployee,
  updateEmployee,
  getEmployeeDetails,
} = require("../../database/shop/crudemployee");
const code = require("../../error/code");

const router = require("express").Router();

// required permission(owner)
router.get("/", async (req, res, next) => {
  try {
    const { shopinfoid } = req.query;
    const data = await getEmployeeDetails(shopinfoid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});
// add parters and staff
// Todo : invitation send
// required permission(owner)
router.post("/add", async (req, res, next) => {
  try {
    const { shopinfoid, jobtitle, phonenumber } = req.body;
    await addEmployee(shopinfoid, jobtitle, phonenumber);
    return res.status(code.OK).json("Invitation send success fully");
  } catch (error) {
    next(error);
  }
});

//when employee accept invitation
router.post("/accept", async (req, res, next) => {
  try {
    const { shopinfoid, user, invitepassword } = req.body;
    await acceptedEmployee(shopinfoid, user, invitepassword);
    return res.status(code.OK).json("success");
  } catch (error) {
    next(error);
  }
});

router.post("/reject", async (req, res, next) => {
  try {
    const { shopinfoid, user } = req.body;
    await rejectedEmployee(shopinfoid, user);
    return res.status(code.OK).json("success");
  } catch (error) {
    next(error);
  }
});
// required permission(owner)
router.delete("/remove", async (req, res, next) => {
  try {
    const { shopinfoid, userid } = req.body;
    await removeEmployee(shopinfoid, userid);
    return res.status(code.OK).json("success");
  } catch (error) {
    next(error);
  }
});
// required permission(owner)
// update jobtitle of a employee
router.post("/update", async (req, res, next) => {
  try {
    const { shopinfoid, userid, jobtitle } = req.body;
    await updateEmployee(shopinfoid, userid, jobtitle);
    return res.status(code.OK).json("success");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
