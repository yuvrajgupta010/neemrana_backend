const jwtToken = require("jsonwebtoken");

const secret = "yoyohoneysingh";

exports.generateToken = (obj) => {
  return jwtToken.sign(obj, secret, { expiresIn: "24h" });
};

exports.extractTokenData = (token) => {
  return jwtToken.verify(token, secret);
};
