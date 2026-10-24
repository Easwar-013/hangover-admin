import mongoose from 'mongoose';

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Message;
}

const MessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['New', 'Read', 'Replied'], default: 'New' },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);