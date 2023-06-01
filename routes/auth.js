const express = require("express");
const {
  managementLogin,
  createUser,
  createCustomer,
  forgetPassword,
  setNewPassword,
  resetPassword,
  customerLogin,
  getManagementData,
  getCustomerData,
} = require("../controller/auth");
const { isAuthenicated, isAdmin } = require("../middleware/managementVerifier");
const { customerIsAuthenicated } = require("../middleware/customerVerifier");

const router = express.Router();

//////////////////////////////////
// management

router.get("/management/get-data", isAuthenicated, getManagementData);

router.post("/management/login", managementLogin);

router.post("/management/create-user", isAuthenicated, isAdmin, createUser);

//////////////////////////////////
// customer

router.get("/customer/get-data", customerIsAuthenicated, getCustomerData);

router.post("/customer/login", customerLogin);

router.post("/customer/create-account", createCustomer);

router.post("/customer/forget-password", forgetPassword);

router.post("/customer/reset-password", customerIsAuthenicated, resetPassword);

router.post("/customer/new-password", customerIsAuthenicated, setNewPassword);

module.exports = router;
