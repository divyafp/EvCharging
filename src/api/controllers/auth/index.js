// controllers
const SendSms = require("../../controllers/twilio/index");

// models
const Users = require("../../models/auth/users");

// object id

const ObjectId = require("mongodb").ObjectId;

// moment

const moment = require("moment");

// helper function

const { delete_file } = require("../../../utils/helpers");
const CountryCode = require("../../models/admin/country-code");

const register = async (req, res) => {
  try {
    const { name, phone, email, country_code_id, notification_token } =
      req.body;

    if (!name || !phone) {
      return res
        .status(200)
        .json({ status: false, message: "All fields are required" });
    }

    const existingPhoneUser = await Users.findOne({ country_code_id, phone });
    const existingEmailUser = await Users.findOne({ email });
    if (existingPhoneUser) {
      if (existingPhoneUser?.status == "delete") {
        return res.status(200).json({
          status: false,
          message:
            "Your account has been deleted on this number. Please create an account using a different number.",
        });
      } else if (existingPhoneUser?.status == "suspend") {
        return res.status(200).json({
          status: false,
          message:
            "Your account has been suspended on this number. Please contact our team for assistance.",
        });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "Phone number already exists" });
      }
    } else if (existingEmailUser) {
      if (existingEmailUser?.status == "delete") {
        return res.status(200).json({
          status: false,
          message:
            "Your account has been deleted on this email. Please create an account using a different number.",
        });
      } else if (existingPhoneUser?.status == "suspend") {
        return res.status(200).json({
          status: false,
          message:
            "Your account has been suspended on this number. Please contact our team for assistance.",
        });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "Email already exists" });
      }
    } else {
      const user = await Users.create({ name, country_code_id, phone, email });
      // const token = jwt.sign({ userId: user._id }, tokenSecretKey, { expiresIn: '1h' });
      res.status(200).json({
        status: true,
        data: user,
        message: "User registered successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ status: false, message: error.message });
  }
};

const registerSocialAccount = async (req, res) => {
  try {
    const {
      social_id,
      country_code_id,
      name,
      phone,
      email,
      notification_token,
    } = req.body;

    if (!social_id) {
      return res
        .status(200)
        .json({ status: false, message: "social_id is required" });
    } else {
      const user = await Users.findOne({ social_id });

      if (user) {
        if (user?.status == "delete") {
          return res.status(200).json({
            status: false,
            message:
              "Your account has been deleted on this id. Please create an account using a different social id.",
          });
        } else if (user?.status == "suspend") {
          return res.status(200).json({
            status: false,
            message:
              "Your account has been suspended on this number. Please contact our team for assistance.",
          });
        } else {
          return res.status(200).json({
            status: false,
            message: "This account already registered.",
          });
        }
      } else {
        const existingPhoneUser = await Users.findOne({
          country_code_id,
          phone,
        });
        const existingEmailUser = await Users.findOne({ email });
        if (existingPhoneUser) {
          return res
            .status(200)
            .json({ status: false, message: "Phone number already exists" });
        } else if (existingEmailUser) {
          return res
            .status(200)
            .json({ status: false, message: "Email already exists" });
        } else {
          const user = await Users.create({
            name,
            phone,
            email,
            social_id,
            notification_token,
          });
          return res.status(200).json({
            status: true,
            data: user,
            message: "User registered successfully",
          });
        }
      }
    }
  } catch (error) {
    res.status(200).json({ status: false, message: "Internal Server Error" });
  }
};

const socialLogin = async (req, res) => {
  try {
    const { social_id, notification_token } = req.body;

    if (!social_id) {
      return res
        .status(200)
        .json({ status: false, message: "social_id is required" });
    } else {
      const user = await Users.findOne({ social_id });
      if (user) {
        if (user?.status == "delete") {
          return res.status(200).json({
            status: false,
            message:
              "Your account has been deleted on this id. Please create an account using a different social id.",
          });
        } else if (user?.status == "suspend") {
          return res.status(200).json({
            status: false,
            message:
              "Your account has been suspended on this number. Please contact our team for assistance.",
          });
        } else {
          const user_update = await Users.findOneAndUpdate(
            { _id: new ObjectId(user?._id) },
            { $set: { notification_token: notification_token } },
            { new: true } // Return the modified document
          );
          return res.status(200).json({
            status: true,
            data: user_update,
            message: "Login successfully.",
          });
        }
      } else {
        res.status(200).json({ status: false, message: "User not found!" });
      }
    }
  } catch (error) {
    res.status(200).json({ status: false, message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { country_code_id, phone, notification_token } = req.body;
    const randomFourDigitNumber = Math.floor(Math.random() * 9000) + 1000;

    if (!country_code_id || !phone) {
      res.status(200).json({
        status: false,
        message: "country_code_id and phone is required",
      });
    } else {
      const user = await Users.findOne({ country_code_id, phone });

      if (!user) {
        return res
          .status(200)
          .json({ status: false, message: "User not found" });
      } else {
        if (user?.status == "suspend") {
          res.status(200).json({
            status: false,
            message: "Your account has been suspended",
          });
        } else if (user?.status == "delete") {
          res
            .status(200)
            .json({ status: false, message: "Your account has been deleted." });
        } else {
          const user_update = await Users.findOneAndUpdate(
            { _id: new ObjectId(user?._id) },
            { $set: { notification_token: notification_token } },
            { new: true }
          );
          const country_codes = await CountryCode.findOne({
            _id: country_code_id,
          });
          SendSms(
            country_codes?.country_code + phone,
            `EvCharging Verification: Your one-time verification code is ${randomFourDigitNumber}. Please use this code to complete the verification process for your EvCharging account. Keep this code confidential and do not share it with anyone. If you did not initiate this verification, please disregard this message.`
          );
          res.status(200).json({
            status: true,
            data: user_update,
            OTP: randomFourDigitNumber,
            message: "Login successfully.",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(200).json({ status: false, message: "Internal Server Error" });
  }
};

const fetchProfile = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res
        .status(200)
        .json({ status: false, message: "_id is required" });
    } else {
      const user = await Users.findOne({ _id });
      if (!user) {
        return res
          .status(200)
          .json({ status: false, message: "User not found" });
      } else {
        res.status(200).json({
          status: true,
          data: user,
          message: "Profile fetch successfully.",
        });
      }
    }
  } catch (error) {
    res.status(200).json({ status: false, message: "Internal Server Error" });
  }
};

const registrationOtpVerfication = async (req, res) => {
  try {
    const randomFourDigitNumber = Math.floor(Math.random() * 9000) + 1000;
    const { phone } = req.body;
    if (!phone) {
      return res
        .status(200)
        .json({ status: false, message: "Phone number is required" });
    } else if (await Users.findOne({ phone })) {
      return res
        .status(200)
        .json({ status: false, message: "Phone number already exists" });
    } else {
      const user = await Users.findOne({ phone });
      const country_codes = await CountryCode.findOne({
        _id: user?.country_code_id,
      });
      SendSms(
        country_codes?.country_code + phone,
        `EvCharging Verification: Your one-time verification code is ${randomFourDigitNumber}. Please use this code to complete the verification process for your EvCharging account. Keep this code confidential and do not share it with anyone. If you did not initiate this verification, please disregard this message.`
      );
      return res.status(200).json({
        status: true,
        data: { OTP: randomFourDigitNumber },
        message: "We have sent an OTP to your number.",
      });
    }
  } catch (error) {
    res.status(200).json({ status: false, message: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    const { _id, name, bike_mode, phone, country_code_id } = req.body;
    if (!_id) {
      return res
        .status(200)
        .json({ status: false, message: "_id is required" });
    }
    const user = await Users.findOne({ _id });
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found" });
    } else {
      const existingUsers = await Users.findOne({
        $and: [
          { _id: { $ne: _id } }, // Exclude the current record
          { $or: [{ phone }] },
        ],
      });

      if (existingUsers) {
        return res.status(200).json({
          status: false,
          message: "email or phone no is already exist",
        });
      } else {
        user.name = name || user.name;
        user.bike_mode = bike_mode || user.bike_mode;
        user.phone = phone || user.phone;
        user.country_code_id = country_code_id || user.country_code_id;

        if (req.file) {
          delete_file("/uploads/users/", user.profile_image);
          user.profile_image = req.file.filename;
        }

        const updatedUser = await user.save();
        if (updatedUser) {
          res.status(200).json({
            status: true,
            data: updatedUser,
            message: "Profile updated successfully",
          });
        } else {
          res
            .status(200)
            .json({ status: false, message: "Something went wrong!" });
        }
      }
    }
  } catch (error) {
    res.status(200).json({ status: false, message: error.message });
  }
};

module.exports = {
  register,
  registerSocialAccount,
  socialLogin,
  login,
  fetchProfile,
  registrationOtpVerfication,
  editProfile,
};
