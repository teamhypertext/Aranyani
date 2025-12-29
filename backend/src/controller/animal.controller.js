import AnimalEvent from "../models/animalrecord.models.js";

export const addAnimalRecord = async (req, res) => {
  try {
    const { animalType, nodeId, lat, lng, img_url } = req.body;

    if (!animalType || !nodeId || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide animalType, nodeId, lat, and lng.",
      });
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

    return res.status(201).json({
      success: true,
      message: "Animal record created successfully",
      data: savedRecord,
    });

  } catch (error) {
    console.error("Error adding animal record:", error);
    
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
    });

    return res.status(200).json({
      success: true,
      count: animals.length,
      data: animals,
    });

  } catch (error) {
    console.error("Error fetching nearby animals:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching nearby animals",
      error: error.message,
    });
  }
};
