import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    username: {
      type: String,
      trim: true
    },

    // For Firebase Cloud Messaging notifications
    fcmToken: {
      type: String,
      trim: true
    },

    lastLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: undefined 
      }
    }
  },
  { timestamps: true }
);

// Index for geospatial queries on lastLocation
userSchema.index({ lastLocation: "2dsphere" });

export default mongoose.model("User", userSchema);
