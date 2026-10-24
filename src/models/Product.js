import mongoose from 'mongoose';

// Delete cached model in dev so schema changes register instantly
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Product;
}

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    offer: { type: Number, default: 0 },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    images: [{ type: String }],
    sideImage: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    trendingAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);