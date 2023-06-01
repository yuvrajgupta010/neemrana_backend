const db = require("../util/db");
const { extractTokenData } = require("../util/jwt");

exports.isAuthenicated = (req, res, next) => {
  const authorizationToken = req.header("Authorization") || "xyz";
  try {
    const extractedData = extractTokenData(authorizationToken);
    // console.log(extractedData);
    db.query("select * from management where username = $1", [
      extractedData.username,
    ]).then((data) => {
      const user = data[0];
      if (user === undefined) {
        res.status(401).json({ message: "Unathorizated Access" });
        return;
      }
      extractedData.is_admin = user.is_admin;
      req.tokenData = extractedData;

      next();
    });
  } catch (error) {
    res.status(401).json({ message: "Unathorizated Access" });
  }
};

exports.isAdmin = (req, res, next) => {
  const { isAdmin } = req.tokenData;
  if (!isAdmin) {
    res.status(401).json({ message: "Unathorizated Access" });
    return;
  }
  next();
};
