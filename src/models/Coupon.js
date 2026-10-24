import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountPercent: { type: Number, required: true }, // e.g., 20 for 20%
  minOrderAmount: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
});

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);