const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer().none();
const path = require('path');
const fs = require('fs');
const AuthMiddleware = require('../middlewares/authMiddleware');

const {
  login,
  createStation,
  editStation,
  deleteStation,
  stationDetail,
  stationList,
  createStationPort,
  editStationPort,
  stationPortDetail,
  stationPortList,
  deletePort,
  register,
  registerationOtpVerification,
  editProfile,
  fetchProfile,
  createStationRadius,
  editStationRadius,
  fetchRadius,
  stationReviews,
  users,
  userFetchDetail,
  userEditDetail,
  cancelBooking,
  changePassword,
  verifyEmail,
  forgetPassword,
  subAdminRegister,
  subAdminList,
  editAdminRole,
  createEnvironmentVariables,
  fetchEnvironmentVariables
} = require('../controllers/admin');
const headerMiddleware = require('../middlewares/headerMiddleware');
const EnvironmentVariable = require('../models/admin/environment-variable');

// Destination folder
const destinationFolder = './uploads/station_images/';
const countryFolder = './uploads/country_images/';
const portFolder = './uploads/port_images/';
const userFolder = './uploads/users/';

// Create the destination folder if it doesn't exist

if (!fs.existsSync(countryFolder)) {
  fs.mkdirSync(countryFolder, { recursive: true });
}

if (!fs.existsSync(userFolder)) {
  fs.mkdirSync(userFolder, { recursive: true });
}

if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

if (!fs.existsSync(portFolder)) {
  fs.mkdirSync(portFolder, { recursive: true });
}

// Set storage engine
const storage_user = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Set storage engine
const storage_port = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, portFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload_single = multer({ storage: storage_user }).single('profile_image');
const upload_single_station = multer({ storage }).single('station_image');
const upload_single_port = multer({ storage: storage_port }).single('port_image');

// auth

router.post("/login", upload, login);
router.post("/register", upload, register);
router.post("/registration_otp_verfication", upload, registerationOtpVerification);
router.post("/change_password", upload, changePassword);
router.post("/verify_email", upload, verifyEmail);
router.post("/forget_password", upload, forgetPassword);

// sub admin

router.post("/sub_admin_register", upload_single, subAdminRegister);
router.post("/sub_admin_list", upload_single, subAdminList);
router.post("/edit_sub_admin_role", upload, editAdminRole);


// admin profile 

router.post("/edit_profile", AuthMiddleware, upload_single, editProfile);
router.post("/fetch_profile", upload, fetchProfile);

// station

router.get("/station_list", headerMiddleware, stationList);
router.post("/create_station", upload_single_station, createStation);
router.post("/edit_station", upload_single_station, editStation);
router.post("/station_detail", upload, stationDetail);
router.post("/delete_station", upload, deleteStation);

// station port

router.post("/station_port_list", upload, stationPortList);
router.post("/create_station_port", upload_single_port, createStationPort);
router.post("/edit_station_port", upload_single_port, editStationPort);
router.post("/station_port_detail", upload, stationPortDetail);
router.post("/delete_port", upload, deletePort);
router.post("/station_reviews", upload, stationReviews);

// station radius 

router.post("/create_station_radius", upload, createStationRadius);
router.post("/edit_station_radius", AuthMiddleware, upload_single, editStationRadius);
router.post("/fetch_radius", upload, fetchRadius);

// app users

router.post("/users", users);
router.post("/user_fetch_profile", upload, userFetchDetail);
router.post("/edit_user_detail", upload_single, userEditDetail);

// booking
router.post("/cancel_booking", upload_single, cancelBooking);

// environment variables
router.post("/environment_variable", upload_single, createEnvironmentVariables);
router.post("/fetch_environment_variable", upload_single, fetchEnvironmentVariables);


module.exports = router;