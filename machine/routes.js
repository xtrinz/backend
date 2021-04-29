const express = require("express")
const router = express.Router()
/* user-cancel */
router.post("/user/cancel", async (req, res, next) =>
{
    try
    {
        console.log("hello")
        res.json(
        {
            "msg":"wlcm",
            "yellow":"red",
            "green" : "blue"
        })

    } catch (error) {
      next(error);
    }
})
/* shop-reject */
router.post("/shop/reject", async (req, res, next) =>
{
    try
    {

    } catch (error) {
      next(error);
    }
})
/* shop-accept */
router.post("/shop/accept", async (req, res, next) =>
{
    try
    {

    } catch (error) {
      next(error);
    }
})
/* shop-despatch */
router.post("/shop/desptch", async (req, res, next) =>
{
    try
    {

    } catch (error) {
      next(error);
    }
})
/* agent-ignore */
router.post("/agent/ignore", async (req, res, next) =>
{
    try
    {

    } catch (error) {
      next(error);
    }
})
/* agent-accept */
router.post("/agent/accept", async (req, res, next) =>
{
    try
    {

    } catch (error) {
      next(error);
    }
})
/* agent-reject */
router.post("/agent/reject", async (req, res, next) =>
{
    try
    {

    } catch (error) {
      next(error);
    }
})
/* agent-complete */
router.post("/agent/complete", async (req, res, next) =>
{
    try
    {

    } catch (error) {
      next(error);
    }
})

module.exports = router