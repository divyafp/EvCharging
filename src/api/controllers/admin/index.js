// controller
const SendSms = require("../../controllers/twilio/index");

// models
const AdminUsers = require("../../models/admin/admin-users");
const Station = require("../../models/admin/create-station");
const Port = require("../../models/admin/create-port");
const StationradiusUsers = require("../../models/admin/station-radius");
const Rating = require("../../models/logged-in/station-rating");
const Users = require("../../models/auth/users");
const CountryCode = require("../../models/admin/country-code");
const Stations = require("../../models/admin/create-station");
const Vehicles = require("../../models/admin/vehicle");
const PrivacyPolicy = require("../../models/admin/privacy-policy");
const TermsAndConditions = require("../../models/admin/terms-and-conditions");
const Faqs = require("../../models/admin/faqs");

// object id
const ObjectId = require("mongodb").ObjectId;

// moment
const moment = require("moment");
const mongoose = require("mongoose");
const OneSignal = require("onesignal-node");

// helper functions
const {
  delete_file,
  sendNotification,
  sendEmail,
} = require("../../../utils/helpers");
const Booking = require("../../models/logged-in/booking");
const Wallet = require("../../models/logged-in/wallet");
const Transaction = require("../../models/logged-in/transaction");
const EnvironmentVariable = require("../../models/admin/environment-variable");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json({
        status: false,
        message: "All fields are required",
      });
    }

    // Use findOne with a query object specifying both email and password
    const user = await AdminUsers.findOne({
      email,
      password,
    });

    if (!user) {
      return res.status(200).json({
        status: false,
        message: "Invalid email or password",
      });
    } else {
      const user_update = {
        ...user.toObject(),
        role_id: "super_admin",
      };
      res.status(200).json({
        status: true,
        data: email == "admin@gmail.com" ? user_update : user,
        message: "Login successful",
      });
    }
  } catch (error) {
    console.error("error", error);
    res.status(200).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const createStation = async (req, res) => {
  try {
    const {
      station_name,
      latitude,
      longitude,
      location,
      start_time,
      end_time,
    } = req.body;

    if ((!station_name || !latitude, !longitude, !location)) {
      return res.status(200).json({
        status: false,
        message: "All fields are required",
      });
    }

    await Stations.create({
      station_name,
      latitude,
      longitude,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        name: location,
      },
      station_image: req.file ? req.file.filename : null,
      start_time,
      end_time,
    });

    res.status(200).json({
      status: true,
      message: "Station created successfully",
    });
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const editStation = async (req, res) => {
  try {
    const {
      _id,
      station_name,
      latitude,
      longitude,
      location,
      start_time,
      end_time,
    } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }
    const station = await Station.findOne({
      _id,
    });
    if (!station) {
      return res.status(200).json({
        status: false,
        message: "Station not found",
      });
    }

    station.station_name = station_name || station.station_name;
    station.start_time = start_time || station.start_time;
    station.end_time = end_time || station.end_time;
    station.location.coordinates =
      [parseFloat(longitude), parseFloat(latitude)] ||
      station.location.coordinates;
    station.location.name = location || station.location.name;

    if (req.file) {
      delete_file("/uploads/station_images/", station.station_image);
      station.station_image = req.file.filename;
    }

    const updatedStation = await station.save();

    res.status(200).json({
      status: true,
      data: updatedStation,
      message: "Station updated successfully",
    });
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const deleteStation = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "Station not found",
      });
    }

    const deletedStation = await Station.findByIdAndDelete(_id);
    res.status(200).json({
      status: true,
      message: "Station delete successfully.",
    });
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const stationDetail = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const station = await Station.aggregate([
      {
        $match: { _id: new ObjectId(_id) },
      },
      {
        $lookup: {
          from: "bookings",
          let: { station_id: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$station_id", "$$station_id"],
                },
              },
            },
          ],
          as: "bookings",
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $lookup: {
          from: "station_reviews",
          let: { station_id: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$station_id", "$$station_id"],
                },
              },
            },
          ],
          as: "reviews",
        },
      },
      {
        $lookup: {
          from: "ports",
          let: { station_id: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$station_id", "$$station_id"],
                },
              },
            },
          ],
          as: "ports",
        },
      },
    ]).exec();

    if (station.length === 0) {
      return res.status(200).json({
        status: false,
        message: "Station not found",
      });
    } else {
      res.status(200).json({
        status: true,
        data: station[0], // Assuming there's only one station with the given _id
        message: "Station fetch successfully.",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const stationList = async (req, res) => {
  try {
    const stations = await Station.find({}).sort({ _id: -1 }).exec();
    res.status(200).json({
      status: true,
      data: stations,
      message: "Stations fetch successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const createStationPort = async (req, res) => {
  try {
    const {
      station_id,
      port_type,
      charging_power,
      unit_price,
      port_name,
      port_description,
      charger_id,
      connector_id,
    } = req.body;
    if (
      !station_id ||
      !port_type ||
      !charging_power ||
      !unit_price ||
      !port_name ||
      !connector_id ||
      !charger_id ||
      !port_name ||
      !port_description
    ) {
      return res.status(200).json({
        status: false,
        message: "All fields are required",
      });
    } else {
      await Port.create({
        station_id,
        port_type,
        unit_price,
        port_name,
        charging_power,
        port_description,
        charger_id,
        connector_id,
        port_image: req.file ? req.file.filename : null,
      });
      res.status(200).json({
        status: true,
        message: "Port created successfully",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const editStationPort = async (req, res) => {
  try {
    const {
      _id,
      port_type,
      unit_price,
      port_name,
      charging_power,
      port_description,
      charger_id,
      connector_id,
    } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }
    const port = await Port.findOne({
      _id,
    });
    if (!port) {
      return res.status(200).json({
        status: false,
        message: "Port not found",
      });
    } else {
      port.port_type = port_type || port.port_type;
      port.unit_price = unit_price || port.unit_price;
      port.port_name = port_name || port.port_name;
      port.charging_power = charging_power || port.charging_power;
      port.port_description = port_description || port.port_description;
      port.charger_id = charger_id || port.charger_id;
      port.connector_id = connector_id || port.connector_id;
      if (req.file) {
        delete_file("/uploads/port_images/", port.port_image);
        port.port_image = req.file.filename;
      }
      const updatePort = await port.save();
      if (updatePort) {
        res.status(200).json({
          status: true,
          message: "Port updated successfully",
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Something went wrong!",
        });
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const stationPortDetail = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const port = await Port.findOne({
      _id,
    });
    if (!port) {
      return res.status(200).json({
        status: false,
        message: "Port not found",
      });
    } else {
      res.status(200).json({
        status: true,
        data: port,
        message: "Port fetch successfully.",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const stationPortList = async (req, res) => {
  try {
    const { station_id } = req.body;
    if (!station_id) {
      return res.status(200).json({
        status: false,
        message: "station_id is required",
      });
    }

    const port = await Port.find({
      station_id,
    })
      .sort({
        _id: -1,
      })
      .exec();
    if (!port) {
      return res.status(200).json({
        status: false,
        message: "Ports not found",
      });
    } else {
      res.status(200).json({
        status: true,
        data: port,
        message: "Ports fetch successfully.",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const deletePort = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "Port not found",
      });
    }

    const deletedPort = await Port.findByIdAndDelete(_id);
    res.status(200).json({
      status: true,
      message: "Port delete successfully.",
    });
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const randomFourDigitNumber = Math.floor(Math.random() * 9000) + 1000;

    if (!email || !password || !name) {
      return res.status(200).json({
        status: false,
        message: "All fields are required",
      });
    }

    const existingEmailUser = await AdminUsers.findOne({
      email,
    });

    if (existingEmailUser) {
      return res.status(200).json({
        status: false,
        message: "Email already exists",
      });
    }

    const user = await AdminUsers.create({
      email,
      password,
      name,
    });
    // const token = jwt.sign({ userId: user._id }, tokenSecretKey, { expiresIn: '1h' });
    res.status(200).json({
      status: true,
      data: user,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const subAdminRegister = async (req, res) => {
  try {
    const { email, password, name, admin_id, role_id } = req.body;

    if (!email || !password || !name || !admin_id || !role_id) {
      return res.status(200).json({
        status: false,
        message: "All fields are required",
      });
    }

    const existingEmailUser = await AdminUsers.findOne({
      email,
    });

    if (existingEmailUser) {
      return res.status(200).json({
        status: false,
        message: "Email already exists",
      });
    } else {
      const user = await AdminUsers.create({
        email,
        password,
        name,
        admin_id,
        role_id,
        profile_image: req.file ? req.file.filename : null,
      });
      res.status(200).json({
        status: true,
        data: user,
        message: "User registered successfully",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const subAdminList = async (req, res) => {
  try {
    const find = await AdminUsers.find({ email: { $ne: "admin@gmail.com" } })
      .sort({ _id: -1 })
      .exec();
    res.status(200).json({
      status: true,
      data: find,
      message: "Sub admin fetch successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const editAdminRole = async (req, res) => {
  try {
    const { _id, permissions, role_id } = req.body;
    if (!_id || !permissions || !role_id) {
      return res.status(200).json({
        status: false,
        message: "All fields are required!",
      });
    } else {
      const user = await AdminUsers.findOne({
        _id,
      });
      if (!user) {
        return res.status(200).json({
          status: false,
          message: "User not found",
        });
      } else {
        const existingUsers = await AdminUsers.findOne({ _id });
        if (!existingUsers) {
          return res.status(200).json({
            status: false,
            message: "User not found!",
          });
        } else {
          user.role_id = role_id || user.role_id;
          user.permissions = permissions || user.permissions;

          const updatedRole = await user.save();
          if (updatedRole) {
            res.status(200).json({
              status: true,
              message: "User role update successfully",
            });
          } else {
            res.status(200).json({
              status: false,
              message: "Something went wrong!",
            });
          }
        }
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const registerationOtpVerification = async (req, res) => {
  try {
    const randomFourDigitNumber = Math.floor(Math.random() * 9000) + 1000;
    const { email } = req.body;
    if (!email) {
      return res.status(200).json({
        status: false,
        message: "Email is required",
      });
    } else if (
      await AdminUsers.findOne({
        email,
      })
    ) {
      return res.status(200).json({
        status: false,
        message: "Email already exists",
      });
    } else {
      // sendEmail()
      return res.status(200).json({
        status: true,
        data: {
          OTP: randomFourDigitNumber,
        },
        message: "We have sent an OTP to your email.",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const editProfile = async (req, res) => {
  try {
    const { _id, email, password, name } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }
    const user = await AdminUsers.findOne({
      _id,
    });
    if (!user) {
      return res.status(200).json({
        status: false,
        message: "User not found",
      });
    } else {
      const existingUsers = await AdminUsers.findOne({
        $and: [
          { _id: { $ne: _id } }, // Exclude the current record
          { $or: [{ email }] },
        ],
      });

      if (existingUsers) {
        return res.status(200).json({
          status: false,
          message: "email is already exist",
        });
      } else {
        user.email = email || user.email;
        user.password = password || user.password;
        user.name = name || user.name;

        if (req.file) {
          delete_file("/uploads/users/", user.profile_image);
          user.profile_image = req.file.filename;
        }

        const updatedUser = await user.save();
        if (updatedUser) {
          res.status(200).json({
            status: true,
            message: "Profile updated successfully",
          });
        } else {
          res.status(200).json({
            status: false,
            message: "Something went wrong!",
          });
        }
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { user_id, password } = req.body;
    if (!user_id) {
      return res.status(200).json({
        status: false,
        message: "user_id is required",
      });
    }
    const user = await AdminUsers.findOne({
      _id: user_id,
    });
    if (!user) {
      return res.status(200).json({
        status: false,
        message: "User not found",
      });
    } else {
      if (user.password == password) {
        res.status(200).json({
          status: false,
          message: "You cannot change your password to a previous one.",
        });
      } else {
        user.password = password || user.password;
        const update = await user.save();
        res.status(200).json({
          status: true,
          data: update,
          message: "Password updated successfully",
        });
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const randomFourDigitNumber = Math.floor(Math.random() * 9000) + 1000;
    if (!email) {
      return res.status(200).json({
        status: false,
        message: "email is required",
      });
    }
    const user = await AdminUsers.findOne({
      email,
    });
    if (!user) {
      return res.status(200).json({
        status: false,
        message:
          "No account has been found associated with this email address.",
      });
    } else {
      res.status(200).json({
        status: true,
        data: {
          OTP: randomFourDigitNumber,
        },
        message: "We have sent an OTP to your email.",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(200).json({
        status: false,
        message: "Email is required",
      });
    } else if (!password) {
      return res.status(200).json({
        status: false,
        message: "Password is required",
      });
    } else {
      const user = await AdminUsers.findOne({
        email,
      });
      if (!email) {
        return res.status(200).json({
          status: false,
          message: "User not found",
        });
      } else {
        user.password = password || user.password;
        const update = await user.save();
        res.status(200).json({
          status: true,
          data: update,
          message: "Password updated successfully",
        });
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const fetchProfile = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }
    const user = await AdminUsers.findOne({
      _id,
    });
    if (!user) {
      return res.status(200).json({
        status: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      status: true,
      data: user,
      message: "Profile fetch successfully.",
    });
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const createStationRadius = async (req, res) => {
  try {
    const { radius } = req.body;

    if (!radius) {
      return res.status(200).json({
        status: false,
        message: "Radius are required",
      });
    }

    const stationRadius = await StationradiusUsers.find({})
      .sort({ _id: -1 })
      .exec();

    if (stationRadius.length > 0) {
      return res.status(200).json({
        status: false,
        message: "radius already exists",
      });
    }

    const data = await StationradiusUsers.create({
      radius,
    });
    // const token = jwt.sign({ userId: user._id }, tokenSecretKey, { expiresIn: '1h' });
    res.status(200).json({
      status: true,
      message: "Radius add successfully",
    });
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const editStationRadius = async (req, res) => {
  try {
    const { _id, radius } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }
    const fetchRadius = await StationradiusUsers.findOne({
      _id,
    });
    if (!fetchRadius) {
      return res.status(200).json({
        status: false,
        message: "Radius not found",
      });
    } else {
      fetchRadius.radius = radius || fetchRadius.radius;
      const updatedRadius = await fetchRadius.save();
      if (updatedRadius) {
        res.status(200).json({
          status: true,
          message: "Radius updated successfully",
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Somthing went wrong!",
        });
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const fetchRadius = async (req, res) => {
  try {
    const radius = await StationradiusUsers.find({}).sort({ _id: -1 }).exec();
    if (!radius) {
      return res.status(200).json({
        status: false,
        message: "Radius not found",
      });
    }
    res.status(200).json({
      status: true,
      data: radius,
      message: "Radius fetch successfully.",
    });
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const stationReviews = async (req, res) => {
  try {
    const { station_id } = req.body;
    if (!station_id) {
      return res
        .status(200)
        .json({ status: true, data: [], message: "station_id is required" });
    } else {
      const stationRating = await Rating.find({ station_id })
        .sort({ _id: -1 })
        .exec();
      if (stationRating) {
        return res.status(200).json({
          status: true,
          data: stationRating,
          message: "Review fetch successfully.",
        });
      } else {
        return res
          .status(200)
          .json({ status: false, data: [], message: "Reviews not found!" });
      }
    }
  } catch (error) {
    console.error(error);
    return res
      .status(200)
      .json({ status: false, data: [], message: "Internal Server Error" });
  }
};

const users = async (req, res) => {
  try {
    const users = await Users.aggregate([
      {
        $lookup: {
          from: "country_codes",
          let: { countryId: "$country_code_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toString: "$_id" }, "$$countryId"] },
              },
            },
          ],
          as: "country",
        },
      },
    ]).exec();

    const modified_array = users.map((item, index) => {
      return {
        ...item,
        phone: (item.country?.[0]?.country_code || "") + item.phone,
      };
    });

    res.status(200).json({
      status: true,
      data: modified_array,
      message: "Users fetch successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const userFetchDetail = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }
    const user = await Users.findOne({
      _id,
    });
    if (!user) {
      return res.status(200).json({
        status: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        status: true,
        data: user,
        message: "Profile fetch successfully.",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const userEditDetail = async (req, res) => {
  try {
    const { _id, email, name, phone, bike_mode, status } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }
    const user = await Users.findOne({ _id });
    if (!user) {
      return res.status(200).json({
        status: false,
        message: "User not found",
      });
    }

    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.name = name || user.name;
    user.bike_mode = bike_mode || user.bike_mode;
    user.status = status || user.status;

    if (req.file) {
      user.profile_image = req.file.filename;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      status: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const createCountryCode = async (req, res) => {
  try {
    console.log("req.file.filename", req.file.filename);
    const { country_code, country_name, country_short_name } = req.body;

    // Check for missing fields
    if (!country_code || !country_name || !country_short_name) {
      return res.status(200).json({
        status: false,
        message: "All fields are required",
      });
    } else {
      // Check if country code, country name, or country short name already exist
      const existingCountry = await CountryCode.findOne({
        $or: [{ country_code }, { country_name }, { country_short_name }],
      });

      if (existingCountry) {
        return res.status(200).json({
          status: false,
          message:
            "Country code, country name, or country short name already exists",
        });
      } else {
        // Create country code
        const countryCode = await CountryCode.create({
          country_code,
          country_short_name,
          country_name,
          country_image: req.file ? req.file.filename : null,
        });

        // Check if the creation was successful
        if (countryCode) {
          res.status(200).json({
            status: true,
            message: "Country code created successfully",
          });
        } else {
          res.status(200).json({
            status: false,
            message: "Failed to create country code",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error creating country code:", error);
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const editCountryCode = async (req, res) => {
  try {
    const { _id, country_code, country_name, country_short_name } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }
    const countryCode = await CountryCode.findOne({
      _id,
    });
    if (!countryCode) {
      return res.status(200).json({
        status: false,
        message: "Country code not found",
      });
    } else {
      const existingCountry = await CountryCode.findOne({
        $and: [
          { _id: { $ne: _id } }, // Exclude the current record
          { $or: [{ country_code }, { country_name }, { country_short_name }] },
        ],
      });

      if (existingCountry) {
        return res.status(200).json({
          status: false,
          message:
            "Country code, country name, or country short name already exists",
        });
      } else {
        countryCode.country_code = country_code || countryCode.country_code;
        countryCode.country_name = country_name || countryCode.country_name;
        countryCode.country_short_name =
          country_short_name || countryCode.country_short_name;

        if (req.file) {
          delete_file("/uploads/country_images/", countryCode.country_image);
          countryCode.country_image = req.file.filename;
        }

        const updatedCountryCode = await countryCode.save();
        if (updatedCountryCode) {
          res.status(200).json({
            status: true,
            message: "Country code updated successfully",
          });
        } else {
          res.status(200).json({
            status: false,
            message: "Something went wrong!",
          });
        }
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const fetchCountryCodes = async (req, res) => {
  try {
    const countryCode = await CountryCode.find({}).sort({ _id: -1 }).exec();
    res.status(200).json({
      status: true,
      data: countryCode,
      message: "Country code fetch successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const fetchCountryCodeDetail = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    } else {
      const countryCode = await CountryCode.findOne({ _id })
        .sort({ _id: -1 })
        .exec();
      res.status(200).json({
        status: true,
        data: countryCode,
        message: "Country code fetch successfully.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const deleteCountryCode = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const deletedCountryCode = await CountryCode.findByIdAndDelete(_id);

    if (deletedCountryCode) {
      res.status(200).json({
        status: true,
        message: "Country code delete successfully.",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Somthing went wrong!",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const createVehicleMode = async (req, res) => {
  try {
    const { vehicle_name, model_no } = req.body;

    // Check for missing fields
    if (!vehicle_name) {
      return res.status(200).json({
        status: false,
        message: "Vehicle is required",
      });
    } else {
      // Check if country code, country name, or country short name already exist
      const existingCountry = await Vehicles.findOne({
        $or: [{ vehicle_name, model_no }],
      });

      if (existingCountry) {
        return res.status(200).json({
          status: false,
          message: "Vehicle name is already exist",
        });
      } else {
        // Create country code
        const vehicleCreate = await Vehicles.create({ vehicle_name, model_no });
        // Check if the creation was successful
        if (vehicleCreate) {
          res.status(200).json({
            status: true,
            message: "Vehicle created successfully",
          });
        } else {
          res.status(200).json({
            status: false,
            message: "Failed to create vehicle",
          });
        }
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const editVehicleMode = async (req, res) => {
  try {
    const { _id, vehicle_name, model_no } = req.body;

    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const findVehicle = await Vehicles.findOne({
      _id,
    });

    if (!findVehicle) {
      return res.status(200).json({
        status: false,
        message: "Vehicle not found",
      });
    } else {
      findVehicle.vehicle_name = vehicle_name || findVehicle.vehicle_name;
      findVehicle.model_no = model_no || findVehicle.model_no;

      const updatedVehicle = await findVehicle.save();

      if (updatedVehicle) {
        res.status(200).json({
          status: true,
          message: "Vehicle updated successfully",
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Something went wrong!",
        });
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const fetchVehicles = async (req, res) => {
  try {
    const countryCode = await Vehicles.find({}).sort({ _id: -1 }).exec();
    res.status(200).json({
      status: true,
      data: countryCode,
      message: "Vehicles fetch successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const fetchVehicleDetail = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    } else {
      const countryCode = await Vehicles.findOne({ _id })
        .sort({ _id: -1 })
        .exec();
      res.status(200).json({
        status: true,
        data: countryCode,
        message: "Vehicle fetch successfully.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const deletedVehicle = await Vehicles.findByIdAndDelete(_id);

    if (deletedVehicle) {
      res.status(200).json({
        status: true,
        message: "Vehicle delete successfully.",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Somthing went wrong!",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const createPrivacyPolicy = async (req, res) => {
  try {
    const { html } = req.body;

    // Check for missing fields
    if (!html) {
      return res.status(200).json({
        status: false,
        message: "HTML is required",
      });
    } else {
      // Check if country code, country name, or country short name already exist
      const existingPrivacyPolicy = await PrivacyPolicy.find({});

      if (existingPrivacyPolicy.length > 0) {
        return res.status(200).json({
          status: false,
          message: "Privacy policy is already exist",
        });
      } else {
        // Create country code
        const privacyPolicyCreate = await PrivacyPolicy.create({ html });
        // Check if the creation was successful
        if (privacyPolicyCreate) {
          res.status(200).json({
            status: true,
            message: "Privacy policy created successfully",
          });
        } else {
          res.status(200).json({
            status: false,
            message: "Failed to privacy policy",
          });
        }
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const editPrivacyPolicy = async (req, res) => {
  try {
    const { _id, html } = req.body;

    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const findPrivacyPolicy = await PrivacyPolicy.findOne({
      _id,
    });

    if (!findPrivacyPolicy) {
      return res.status(200).json({
        status: false,
        message: "Privacy policy not found",
      });
    } else {
      findPrivacyPolicy.html = html || findPrivacyPolicy.html;

      const updatedVehicle = await findPrivacyPolicy.save();

      if (updatedVehicle) {
        res.status(200).json({
          status: true,
          message: "Privacy policy updated successfully",
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Something went wrong!",
        });
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const fetchPrivacyPolicy = async (req, res) => {
  try {
    const findPrivacyPolicy = await PrivacyPolicy.find({})
      .sort({ _id: -1 })
      .exec();
    if (findPrivacyPolicy.length > 0) {
      res.status(200).json({
        status: true,
        data: findPrivacyPolicy?.[0],
        message: "Privacy policy fetch successfully.",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Privacy policy not found!",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const deletePrivacyPolicy = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const deleted = await PrivacyPolicy.findByIdAndDelete(_id);

    if (deleted) {
      res.status(200).json({
        status: true,
        message: "Privacy policy delete successfully.",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Somthing went wrong!",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const createTermsAndConditions = async (req, res) => {
  try {
    const { html } = req.body;

    // Check for missing fields
    if (!html) {
      return res.status(200).json({
        status: false,
        message: "HTML is required",
      });
    } else {
      const termsAndConditions = await TermsAndConditions.find({});

      if (termsAndConditions.length > 0) {
        return res.status(200).json({
          status: false,
          message: "Terms and conditions is already exist",
        });
      } else {
        const termsAndConditionsCreate = await TermsAndConditions.create({
          html,
        });
        if (termsAndConditionsCreate) {
          res.status(200).json({
            status: true,
            message: "Terms and conditions created successfully",
          });
        } else {
          res.status(200).json({
            status: false,
            message: "Failed to Terms and conditions",
          });
        }
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const editTermsAndConditions = async (req, res) => {
  try {
    const { _id, html } = req.body;

    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const findTermsAndConditions = await TermsAndConditions.findOne({
      _id,
    });

    if (!findTermsAndConditions) {
      return res.status(200).json({
        status: false,
        message: "Terms and conditions not found",
      });
    } else {
      findTermsAndConditions.html = html || findTermsAndConditions.html;

      const updated = await findTermsAndConditions.save();

      if (updated) {
        res.status(200).json({
          status: true,
          message: "Terms and conditions updated successfully",
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Something went wrong!",
        });
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const fetchTermsAndConditions = async (req, res) => {
  try {
    const findTermsAndConditions = await TermsAndConditions.find({})
      .sort({ _id: -1 })
      .exec();
    if (findTermsAndConditions.length > 0) {
      res.status(200).json({
        status: true,
        data: findTermsAndConditions?.[0],
        message: "Terms and conditions fetch successfully.",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Terms and conditions not found!",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const deleteTermsAndConditions = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const deleted = await TermsAndConditions.findByIdAndDelete(_id);

    if (deleted) {
      res.status(200).json({
        status: true,
        message: "Terms and conditions delete successfully.",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Somthing went wrong!",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const createFaqs = async (req, res) => {
  try {
    const { html } = req.body;

    // Check for missing fields
    if (!html) {
      return res.status(200).json({
        status: false,
        message: "HTML is required",
      });
    } else {
      const find = await Faqs.find({});

      if (find.length > 0) {
        return res.status(200).json({
          status: false,
          message: "Faqs is already exist",
        });
      } else {
        const faqsCreate = await Faqs.create({ html });
        if (faqsCreate) {
          res.status(200).json({
            status: true,
            message: "Faqs created successfully",
          });
        } else {
          res.status(200).json({
            status: false,
            message: "Failed to create faqs",
          });
        }
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const editFaqs = async (req, res) => {
  try {
    const { _id, html } = req.body;

    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const find = await Faqs.findOne({
      _id,
    });

    if (!find) {
      return res.status(200).json({
        status: false,
        message: "Faqs not found",
      });
    } else {
      find.html = html || find.html;

      const updated = await find.save();

      if (updated) {
        res.status(200).json({
          status: true,
          message: "Faqs updated successfully",
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Something went wrong!",
        });
      }
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
};

const fetchFaqs = async (req, res) => {
  try {
    const find = await Faqs.find({}).sort({ _id: -1 }).exec();
    if (find.length > 0) {
      res.status(200).json({
        status: true,
        data: find?.[0],
        message: "Faqs fetch successfully.",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Faqs not found!",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const deleteFaqs = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(200).json({
        status: false,
        message: "_id is required",
      });
    }

    const deleted = await Faqs.findByIdAndDelete(_id);

    if (deleted) {
      res.status(200).json({
        status: true,
        message: "Faqs delete successfully.",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Somthing went wrong!",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res
        .status(200)
        .json({ status: false, message: "_id is required" });
    }
    const user = await Users.findOne({ _id });
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found" });
    } else {
      const existingUsers = await Users.findOne({ _id });

      if (existingUsers) {
        user.name = user.name;
        user.bike_mode = user.bike_mode;
        user.phone = user.phone;
        user.country_code_id = user.country_code_id;
        user.profile_image = user.profile_image;
        user.status = "delete";

        const updatedUser = await user.save();
        if (updatedUser) {
          res
            .status(200)
            .json({ status: true, message: "Account has been deleted" });
        } else {
          res
            .status(200)
            .json({ status: false, message: "Something went wrong!" });
        }
      } else {
        return res.status(200).json({
          status: false,
          message: "email or phone no is already exist",
        });
      }
    }
  } catch (error) {
    res.status(200).json({ status: false, message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res
        .status(200)
        .json({ status: false, message: "_id is required." });
    } else {
      const update = await Booking.findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: { status: "cancel" } },
        { new: true } // Return the modified document
      );
      if (update) {
        const findWallet = await Wallet.findOne({ user_id: update?.user_id });
        const wallet_balance =
          Number(findWallet?.amount) + Number(update?.amount);
        const updatedWallet = await Wallet.updateOne(
          { user_id: update?.user_id },
          { $set: { amount: wallet_balance } }
        );
        if (updatedWallet) {
          const transaction = await Transaction.create({
            user_id: update?.user_id,
            station_id: update?.station_id,
            amount: update?.amount,
            credit_or_debit: "CR",
            transaction_reason: "cancel",
          });
          sendNotification(
            update?.user_id,
            "Booking cancel",
            "We are canceling your booking, and we are refunding the amount to your wallet."
          );
          res.status(200).json({
            status: true,
            message: "Booking cancel successfully.",
          });
        } else {
          res.status(200).json({
            status: true,
            message: "Something went wrong in transaction.",
          });
        }
      } else {
        res.status(200).json({
          status: true,
          message: "Something went wrong!",
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const pushNotification = async (req, res) => {
  try {
    sendNotification("", "", "Booking cancel", "Your booking has been cancled");
  } catch (error) {
    console.error("Error in pushNotification:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error in pushNotification",
      error: error.message,
    });
  }
};

const fetchEnvironmentVariables = async (req, res) => {
  try {
    const find = await EnvironmentVariable.find({}).sort({ _id: -1 }).exec();
    if (find.length > 0) {
      res.status(200).json({
        status: true,
        data: find?.[0],
        message: "Environment variable fetch successfully.",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Environment variable not found!",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const createEnvironmentVariables = async (req, res) => {
  try {
    const { minimum_amount_for_charging, gst, _id } = req.body;

    // Check if environment variables already exist

    if (_id) {
      const existingVariables = await EnvironmentVariable.findById({ _id });

      existingVariables.minimum_amount_for_charging =
        minimum_amount_for_charging ||
        existingVariables.minimum_amount_for_charging;
      existingVariables.gst = gst || existingVariables.gst;

      const updated = await existingVariables.save();

      if (updated) {
        return res.status(200).json({
          status: true,
          message: "Environment variables updated successfully",
        });
      } else {
        return res.status(500).json({
          status: false,
          message: "Failed to update environment variables",
        });
      }
    } else {
      const find = await EnvironmentVariable.find({});
      if (find.length > 0) {
        return res.status(200).json({
          status: false,
          message: "Environment variables is already exist",
        });
      } else {
        // Create new environment variables
        const faqsCreate = await EnvironmentVariable.create({
          minimum_amount_for_charging,
          gst,
        });

        if (faqsCreate) {
          return res.status(200).json({
            status: true,
            message: "Environment variables created successfully",
          });
        } else {
          return res.status(500).json({
            status: false,
            message: "Failed to create environment variables",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in createEnvironmentVariables:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
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
  subAdminRegister,
  subAdminList,
  userFetchDetail,
  userEditDetail,
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
  cancelBooking,
  pushNotification,
  deleteUser,
  changePassword,
  verifyEmail,
  forgetPassword,
  editAdminRole,
  createEnvironmentVariables,
  fetchEnvironmentVariables,
};
