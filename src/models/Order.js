import mongoose from 'mongoose';

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Order;
}

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    userName: { type: String, default: 'Customer' },
    userEmail: { type: String, default: '' },
    userPhone: { type: String, default: '' },
    items: [
      {
        product: { type: mongoose.Schema.Types.Mixed },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        size: { type: String, default: 'M' },
        color: { type: String, default: 'Default' },
        image: { type: String, default: '' },
      },
    ],
    shippingAddress: {
      phone: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    totalAmount: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    paymentMethod: { type: String, default: 'Razorpay' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
    isPaid: { type: Boolean, default: false },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);