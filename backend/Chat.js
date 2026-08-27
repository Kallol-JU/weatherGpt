import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  location: {
    lat: { type: Number },
    lon: { type: Number },
    city: { type: String }
  },
  history: [
    {
      role: { type: String, enum: ['user', 'model'] },
      message: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

export default mongoose.model('Chat', chatSchema);