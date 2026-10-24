import mongoose from 'mongoose';

const StockAlertSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    email: { type: String, required: true },
    productName: { type: String },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.StockAlert || mongoose.model('StockAlert', StockAlertSchema);