const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer().none();
const path = require('path');
const fs = require('fs');

const {
  createCountryCode,
  editCountryCode,
  fetchCountryCodes,
  fetchCountryCodeDetail,
  deleteCountryCode,
  createVehicleMode,
  editVehicleMode,
  fetchVehicles,
  fetchVehicleDetail,
  deleteVehicle,
  createPrivacyPolicy,
  editPrivacyPolicy,
  fetchPrivacyPolicy,
  deletePrivacyPolicy,
  createTermsAndConditions,
  editTermsAndConditions,
  fetchTermsAndConditions,
  deleteTermsAndConditions,
  createFaqs,
  editFaqs,
  fetchFaqs,
  deleteFaqs,
  pushNotification
} = require('../controllers/admin');

// Destination folder
const countryFolder = './uploads/country_images/';

// Create the destination folder if it doesn't exist

if (!fs.existsSync(countryFolder)) {
  fs.mkdirSync(countryFolder, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, countryFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload_single_country_image = multer({ storage }).single('country_image');

// country code
router.post("/create_country_code", upload_single_country_image, createCountryCode);
router.post("/edit_country_code", upload_single_country_image, editCountryCode);
router.post("/fetch_country_code", upload, fetchCountryCodes);
router.post("/fetch_country_code_detail", upload, fetchCountryCodeDetail);
router.post("/delete_country_code", upload, deleteCountryCode);

// Vehicles
router.post("/create_vehicle", upload, createVehicleMode);
router.post("/edit_vehicle", upload, editVehicleMode);
router.post("/fetch_vehicles", upload, fetchVehicles);
router.post("/fetch_vehicle_detail", upload, fetchVehicleDetail);
router.post("/delete_vehicle", upload, deleteVehicle);

// Privacy policy
router.post("/create_privacy_policy", upload, createPrivacyPolicy);
router.post("/edit_privacy_policy", upload, editPrivacyPolicy);
router.post("/fetch_privacy_policy", upload, fetchPrivacyPolicy);
router.post("/delete_privacy_policy", upload, deletePrivacyPolicy);

// Terms and conditions
router.post("/create_terms_and_conditions", upload, createTermsAndConditions);
router.post("/edit_terms_and_conditions", upload, editTermsAndConditions);
router.post("/fetch_terms_and_conditions", upload, fetchTermsAndConditions);
router.post("/delete_terms_and_conditions", upload, deleteTermsAndConditions);

// Faqs
router.post("/create_faqs", upload, createFaqs);
router.post("/edit_faqs", upload, editFaqs);
router.post("/fetch_faqs", upload, fetchFaqs);
router.post("/delete_faqs", upload, deleteFaqs);

// push notification
router.post("/push_notification", upload, pushNotification);

module.exports = router;