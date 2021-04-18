const {
  addEmployee,
  acceptedEmployee,
} = require("../../database/shop/crudemployee");

const router = require("express").Router();

// add parters and staff
// Todo : invitation send
router.post("/employee/add/", async (req, res, next) => {
  const { shopinfoid, jobtitle, phonenumber } = req.body;
  await addEmployee(shopinfoid, jobtitle, phonenumber);
  return res.status(code.OK).json("Invitation send success fully");
});

//when employee accept invitation
router.post("/employee/accept", async (req, res, next) => {
  const { shopinfoid, user, invitepassword } = req.body;
  await acceptedEmployee(shopinfoid, user, invitepassword);
  return res.status(code.OK).json("success");
});

module.exports = router;
