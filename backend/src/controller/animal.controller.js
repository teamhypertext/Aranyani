import AnimalEvent from "../models/animalrecord.models.js";
import User from "../models/user.models.js";
import { sendAnimalAlert } from "../utils/twilio.service.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const findAndNotifyNearbyUsers = async (animalRecord, lat, lng) => {
  try {
    const nearbyUsers = await User.find({
      lastLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 50000,
        },
      },
      mobileNumber: { $exists: true, $ne: null },
    });

    if (nearbyUsers.length === 0) {
      return;
    }

    const notificationResult = await sendAnimalAlert(nearbyUsers, {
      animalType: animalRecord.animalType,
      lat,
      lng,
    });

    return notificationResult;
  } catch (error) {
    throw error;
  }
};

export const addAnimalRecord = async (req, res) => {
  try {
    const { animalType, nodeId, lat, lng, imageBase64 } = req.body;

    if (!animalType || !nodeId || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide animalType, nodeId, lat, and lng.",
      });
    }

    let img_url = null;

    if (imageBase64) {
      try {
        console.log('[Cloudinary] Uploading image from base64...');
        const uploadResponse = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${imageBase64}`,
          {
            folder: 'aranyani-detections',
            resource_type: 'image',
          }
        );
        img_url = uploadResponse.secure_url;
        console.log('[Cloudinary] Upload successful:', img_url);
      } catch (uploadError) {
        console.error('[Cloudinary] Upload failed:', uploadError.message);
        // Continue without image if upload fails
      }
    }

    const animalEvent = new AnimalEvent({
      animalType,
      nodeId,
      img_url,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    });

    const savedRecord = await animalEvent.save();

    findAndNotifyNearbyUsers(savedRecord, parseFloat(lat), parseFloat(lng))
      .catch(error => {});

    return res.status(201).json({
      success: true,
      message: "Animal record created successfully",
      data: savedRecord,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while adding animal record",
      error: error.message,
    });
  }
};

export const getNearbyAnimals = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameters: lat and lng",
      });
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const animals = await AnimalEvent.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 50000,
        },
      },
      detectedAt: {
        $gte: sevenDaysAgo,
      },
    });

    return res.status(200).json({
      success: true,
      count: animals.length,
      data: animals,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching nearby animals",
      error: error.message,
    });
  }
};
