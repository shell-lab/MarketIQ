import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";
import ProfileClientPage from "./ProfileClientPage";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectMongoDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  
  if (user && user.createdAt) {
    user.joinedDate = user.createdAt.toISOString();
  }

  // Convert ObjectId to string
  if (user && user._id) {
    user._id = user._id.toString();
  }

  const plainUser = JSON.parse(JSON.stringify(user));

  return <ProfileClientPage user={plainUser} />;
}