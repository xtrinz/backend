const { ObjectID } = require("mongodb");
const { isObjectEmpty } = require("../../common/utils");
const {
  Api404Error,
  Api409Error,
} = require("../../error/errorclass/errorclass");
const { userCollection, shopInfoCollection } = require("../connect");

const getEmployeeDetails = async function (shopinfoid) {
  const query1 = {
    shopinfoid,
  };
  const shopinfo = await shopInfoCollection.findOne(query1);
  if (isObjectEmpty(shopinfo)) {
    throw new Api404Error("Not found", "Not found");
  }
  let data = [];
  for (const employee of shopinfo.employee) {
    const query2 = {
      _id: employee.userid,
    };
    const user = await userCollection.findOne(query2);
    if (isObjectEmpty(user)) {
      const options3 = {
        $pull: {
          employee: { userid: employee.userid },
        },
      };
      await shopInfoCollection.updateOne(query1, options3);
      continue;
    }
    const arrayData = {
      userid: user._id,
      name: user.firstname + user.lastname,
      phonenumber: user.phonenumber,
      jobtitle: employee.jobtitle,
    };
    data.push(arrayData);
  }
  return data;
};

// Todo : we should sent an invitation to that phone number
const addEmployee = async function (shopinfoid, jobtitle, phonenumber) {
  const query1 = {
    phonenumber,
  };
  const user = await userCollection.findOne(query1);
  if (isObjectEmpty(user)) {
    throw new Api404Error(
      "Not found",
      `user with ${phonenumber} dosn't have an account`
    );
  }
  const query2 = {
    $and: [
      { _id: shopinfoid },
      {
        $or: [
          { employee: { userid: user._id } },
          { tempemployee: { userid: user._id } },
        ],
      },
    ],
  };
  const shopinfo = await shopInfoCollection.findOne(query2);
  if (!isObjectEmpty(shopinfo)) {
    throw new Api409Error(
      "Conflict",
      `Invitation Already send to this ${phonenumber}`
    );
  }
  const query3 = {
    _id: user._id,
  };
  const options3 = {
    $push: {
      notification: {
        _id: new ObjectID(),
        type: "shop employee invitation",
        shopinfoid,
      },
    },
  };
  await userCollection.updateOne(query3, options3);
  const query4 = {
    _id: shopinfoid,
  };
  const options4 = {
    $push: {
      tempemployee: {
        jobtitle,
        userid: user._id,
      },
    },
  };
  await shopInfoCollection.updateOne(query4, options4);
};

const acceptedEmployee = async function (shopinfoid, user, invitepassword) {
  const query1 = {
    _id: shopinfoid,
    invitepassword,
    tempemployee: { userid: user._id },
  };
  const options1 = {
    tempemployee: { $elemMatch: { userid: user._id } },
  };
  const shopinfo = await shopInfoCollection.findOne(query1, options1);
  if (isObjectEmpty(shopinfo)) {
    throw new Api404Error("Not found", "Not found");
  }
  const options2 = {
    $pull: {
      tempemployee: { userid: user._id },
    },
    $push: {
      employee: shopinfo.tempemployee[0],
    },
  };
  await shopInfoCollection.updateOne(query1, options2);
  const query3 = {
    _id: user._id,
    notification: { shopinfoid, type: "shop employee invitation" },
  };
  const options3 = {
    $pull: {
      notification: { shopinfoid, type: "shop employee invitation" },
    },
    $push: {
      shopinfoids: shopinfoid,
    },
  };
  await userCollection.updateOne(query3, options3);
};

const rejectedEmployee = async function (shopinfoid, user) {
  const query1 = {
    _id: shopinfoid,
    tempemployee: { userid: user._id },
  };
  const options1 = {
    $pull: {
      tempemployee: { userid: user._id },
    },
  };
  await shopInfoCollection.updateOne(query1, options1);
  const query2 = {
    _id: user._id,
    notification: { shopinfoid, type: "shop employee invitation" },
  };
  const options2 = {
    $pull: {
      notification: { shopinfoid, type: "shop employee invitation" },
    },
  };
  await userCollection.updateOne(query2, options2);
};

const removeEmployee = async function (shopinfoid, userid) {
  const query1 = {
    _id: shopinfoid,
    employee: { userid },
  };
  const options1 = {
    $pull: {
      employee: { userid },
    },
  };
  await shopInfoCollection.updateOne(query1, options1);
  const query2 = {
    _id: userid,
  };
  const options2 = {
    $pull: {
      shopinfoids: shopinfoid,
    },
  };
  await userCollection.updateOne(query2, options2);
};

const updateEmployee = async function (shopinfoid, userid, jobtitle) {
  const query1 = {
    _id: shopinfoid,
    employee: { userid },
  };
  const options1 = {
    $set: {
      "employee.$.jobtitle": jobtitle,
    },
  };
  await shopInfoCollection.updateOne(query1, options1);
};

module.exports = {
  getEmployeeDetails,
  addEmployee,
  acceptedEmployee,
  rejectedEmployee,
  removeEmployee,
  updateEmployee,
};
