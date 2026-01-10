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

    mobileNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit mobile number!`
      }
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
