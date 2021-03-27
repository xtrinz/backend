const {
  shopInfoCollection,
} = require("../databaseconnections/mongoconnection");

/**
 *
 * @param {It is The number of the page (let's assume our website as a lot of pages)} pageno
 * @param {*number of result in a page} nPerPage
 */
const dataForHomePage = async function (pageno) {
  // find return a cursor limit returened data (for dynamic loading)
  const nPerPage = 30;
  const shopinfo = await shopInfoCollection
    .find({})
    .skip(pageno > 0 ? (pageno - 1) * nPerPage : 0)
    .limit(nPerPage);
  // convert that to array
  const data = await shopinfo.toArray();
  return data;
};

module.exports.dataForHomePage = dataForHomePage;
