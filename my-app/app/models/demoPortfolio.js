import mongoose, { Schema, models } from 'mongoose';

const demoPortfolioSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    cash: { type: Number, required: true, default: 100000 },
    holdings: { type: Schema.Types.Mixed, required: true, default: {} }, // { SYMBOL: qty }
  },
  { timestamps: true }
);

const DemoPortfolio = models.DemoPortfolio || mongoose.model('DemoPortfolio', demoPortfolioSchema);
export default DemoPortfolio;
