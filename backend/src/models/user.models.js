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

    fcmToken: {
      type: String,
      trim: true
    },

    lastLocation: {
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: {
        type: [Number]
      }
    }
  },
  { timestamps: true }
);

userSchema.index({ lastLocation: "2dsphere" });

export default mongoose.model("User", userSchema);
