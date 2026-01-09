import User from "../models/user.models.js";

export const createUser = async (req, res) => {
  try {
    const { deviceId, username, mobileNumber } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required",
      });
    }

    let user = await User.findOne({ deviceId });

    if (user) {
      user.username = username || user.username;
      user.mobileNumber = mobileNumber || user.mobileNumber;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "User already exists, updated details",
        data: user,
      });
    }

    // Create new user
    user = new User({
      deviceId,
      username,
      mobileNumber,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while creating user",
      error: error.message,
    });
  }
};

export const updateUserLocation = async (req, res) => {
  try {
    let deviceId = req.body.deviceId;
     
    if (req.user && req.user.deviceId) {
        deviceId = req.user.deviceId;
    }

    const { lat, lng } = req.body;

    if (!deviceId) {
        return res.status(400).json({
            success: false,
            message: "Device ID is required to update location",
        });
    }

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude (lat) and Longitude (lng) are required",
      });
    }

    const user = await User.findOneAndUpdate(
      { deviceId },
      {
        lastLocation: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
      },
      { new: true } 
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User location updated successfully",
      data: {
        deviceId: user.deviceId,
        location: user.lastLocation,
      },
    });

  } catch (error) {
    console.error("Error updating user location:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while updating location",
      error: error.message,
    });
  }
};
