


import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import Watchlist from "@/models/watchlist";
import User from "@/models/user";
import { NextResponse } from "next/server";

// GET: Fetch user's watchlist
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const watchlist = await Watchlist.find({ user: user._id });
    return NextResponse.json(watchlist);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add a stock to the watchlist
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { symbol } = await req.json();
    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingWatchlistItem = await Watchlist.findOne({ user: user._id, symbol });
    if (existingWatchlistItem) {
      return NextResponse.json({ message: "Stock already in watchlist" }, { status: 409 });
    }

    const newWatchlistItem = new Watchlist({
      user: user._id,
      symbol,
    });

    await newWatchlistItem.save();
    return NextResponse.json(newWatchlistItem, { status: 201 });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove a stock from the watchlist
export async function DELETE(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { symbol } = await req.json();
    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await Watchlist.deleteOne({ user: user._id, symbol });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Stock not found in watchlist" }, { status: 404 });
    }

    return NextResponse.json({ message: "Stock removed from watchlist" }, { status: 200 });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
