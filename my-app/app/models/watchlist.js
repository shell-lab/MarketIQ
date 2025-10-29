import mongoose, { Schema, models } from 'mongoose';

const watchlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Watchlist = models.Watchlist || mongoose.model('Watchlist', watchlistSchema);
export default Watchlist;
