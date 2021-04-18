const {
  addEmployee,
  acceptedEmployee,
  rejectedEmployee,
  removeEmployee,
  updateEmployee,
} = require("../../database/shop/crudemployee");
const code = require("../../error/code");

const router = require("express").Router();

// add parters and staff
// Todo : invitation send
// required permission(owner)
router.post("/add", async (req, res, next) => {
  const { shopinfoid, jobtitle, phonenumber } = req.body;
  await addEmployee(shopinfoid, jobtitle, phonenumber);
  return res.status(code.OK).json("Invitation send success fully");
});

//when employee accept invitation
router.post("/accept", async (req, res, next) => {
  const { shopinfoid, user, invitepassword } = req.body;
  await acceptedEmployee(shopinfoid, user, invitepassword);
  return res.status(code.OK).json("success");
});

router.post("/reject", async (req, res, next) => {
  const { shopinfoid, user } = req.body;
  await rejectedEmployee(shopinfoid, user);
  return res.status(code.OK).json("success");
});
// required permission(owner)
router.delete("/remove", async (req, res, next) => {
  const { shopinfoid, userid } = req.body;
  await removeEmployee(shopinfoid, userid);
  return res.status(code.OK).json("success");
});
// required permission(owner)
// update jobtitle of a employee
router.post("/update", async (req, res, next) => {
  const { shopinfoid, userid, jobtitle } = req.body;
  await updateEmployee(shopinfoid, userid, jobtitle);
  return res.status(code.OK).json("success");
});

module.exports = router;
