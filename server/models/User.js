import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    collegeEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[0-9A-Z]+@aiet\.org\.in$/i, "Please use a valid AIET email (e.g., 4AL23CS001@aiet.org.in)"],
    },
    usn: {
      type: String,
      trim: true,
      default: "",
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function matchPassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
