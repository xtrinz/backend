const {
  shopInfoCollection,
} = require("./connect");
const { Api404Error } = require("../error/errorclass/errorclass");

/**
 *
 * @param {It is The number of the page (let's assume our website as a lot of pages)} pageno
 * @param {*number of result in a page} nPerPage
 */
const dataForHomePage = async function (pageno, longitude, lattitude) {
  // find return a cursor limit returened data (for dynamic loading)
  const nPerPage = 30;
  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, lattitude],
        },
      },
    },
  };
  const skipOption = pageno > 0 ? (pageno - 1) * nPerPage : 0;
  const shopinfo = await shopInfoCollection
    .find(query)
    .skip(skipOption)
    .limit(nPerPage);
  // convert that to array
  const data = await shopinfo.toArray(); // Todo : Geographical querries
  if (data.length == 0) {
    if (pageno == 1) {
      throw new Api404Error(
        "Not found",
        "Our services are not available at this location. Please change to another location"
      );
    }
  }

  return data;
};

module.exports = { dataForHomePage };
