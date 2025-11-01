import mongoose, { Schema, models } from 'mongoose';

const demoTradeSchema = new Schema(
  {
    userId: { type: String, required: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ['buy', 'sell'], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    stopLoss: { type: Number },
    takeProfit: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const DemoTrade = models.DemoTrade || mongoose.model('DemoTrade', demoTradeSchema);
export default DemoTrade;
