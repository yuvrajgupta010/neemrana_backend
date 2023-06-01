const db = require("../util/db");
const { extractTokenData } = require("../util/jwt");

exports.customerIsAuthenicated = (req, res, next) => {
  const authorizationToken = req.header("Authorization") || "xyz";
  try {
    const extractedData = extractTokenData(authorizationToken);
    // console.log(extractedData);
    db.query("select * from customer where email = $1", [
      extractedData.email,
    ]).then((data) => {
      const user = data[0];
      if (user === undefined) {
        res.status(401).json({ message: "Unathorizated Access" });
        return;
      }
      req.tokenData = extractedData;

      next();
    });
  } catch (error) {
    res.status(401).json({ message: "Unathorizated Access" });
  }
};
