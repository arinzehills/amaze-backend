const mongoose = require("mongoose");

module.exports = USER_TYPES = {
  NORMALUSER: "normal_user",
  SUPPORT: "support",
  ADMIN: "admin",
};
const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    middle_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    phone: { type: String },
    city: { type: String },
    country: { type: String },
    dateOB: { type: String },
    profilePicture: { type: String, default: "" },
    user_type: { type: String, default: "normal_user" },
    token: { type: String },
    followers: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
