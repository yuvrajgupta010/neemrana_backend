const express = require("express");
const { isAuthenicated, isAdmin } = require("../middleware/managementVerifier");
const {
  createRoom,
  allRoom,
  deleteRoom,
  editRoom,
  customerQuery,
  getAllQuery,
  queryCleared,
  getAvailableRoom,
  bookRoom,
  getPresentBookings,
  getPastBookings,
  cancelBooking,
  checkIn,
  getBookingData,
  checkOut,
} = require("../controller/rooms");
const { customerIsAuthenicated } = require("../middleware/customerVerifier");

const router = express.Router();

// management

router.post("/management/room", isAuthenicated, isAdmin, createRoom);

router.get("/management/room", isAuthenicated, isAdmin, allRoom);

router.put("/management/room", isAuthenicated, isAdmin, editRoom);

router.delete("/management/room", isAuthenicated, isAdmin, deleteRoom);

router.get("/management/customer-query", isAuthenicated, getAllQuery);

router.delete("/management/customer-query", isAuthenicated, queryCleared);

router.post("/management/get-booking-data", isAuthenicated, getBookingData);

router.post("/management/check-in", isAuthenicated, checkIn);

router.post("/management/check-out", isAuthenicated, checkOut);

// customer

router.post("/customer/available-room", getAvailableRoom);

router.post("/customer/customer-query", customerQuery);

router.post("/customer/book-room", customerIsAuthenicated, bookRoom);

router.post("/customer/cancel-booking", customerIsAuthenicated, cancelBooking);

router.get(
  "/customer/present-bookings",
  customerIsAuthenicated,
  getPresentBookings
);

router.get("/customer/past-bookings", customerIsAuthenicated, getPastBookings);

module.exports = router;
