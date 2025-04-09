const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AuthMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const upload = multer().none();

// Destination folder
const destinationFolder = './uploads/users/';

// Create the destination folder if it doesn't exist
if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload_single = multer({ storage }).single('profile_image');

const {
    register,
    registerSocialAccount,
    socialLogin,
    login,
    fetchProfile,
    registrationOtpVerfication,
    editProfile
} = require('../controllers/auth');

const { deleteUser } = require('../controllers/admin');

// Auth
router.post("/login", upload, login);
router.post("/register", upload, register);
router.post("/registration_otp_verfication", upload, registrationOtpVerfication);
router.post("/social_login", upload, socialLogin);
router.post("/register_social_account", upload, registerSocialAccount);
router.post("/fetch_profile", upload, fetchProfile);
router.post("/edit_profile", AuthMiddleware, upload_single, editProfile);
router.post("/delete_user", upload, deleteUser);

module.exports = router;