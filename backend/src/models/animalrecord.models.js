import mongoose from "mongoose";

const animalEventSchema = new mongoose.Schema(
  {
    animalType: {
      type: String,
      required: true,
      trim: true
    },

    nodeId: {
      type: String,
      required: true
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      }
    },

    detectedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

animalEventSchema.index({ location: "2dsphere" });

export default mongoose.model("AnimalEvent", animalEventSchema);
