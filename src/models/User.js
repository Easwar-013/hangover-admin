import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Set to false so Google OAuth users can sign up without a password
    image: { type: String }, // Stores Google profile picture if signed in via Google
    role: { 
      type: String, 
      enum: ['customer', 'admin'], 
      default: 'customer' 
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);