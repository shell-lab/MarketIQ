"use client"; // 1. Mark this as a Client Component

import { signIn } from "next-auth/react"; // 2. Import the signIn function
import GoogleLogo from "../login/GoogleLogo"; // Corrected import path

export default function GoogleSignInButton() {
  // 3. Create a handler function to call signIn
  const handleSignIn = () => {
    // We specify 'google' to use the Google provider we configured
    signIn("google");
  };

  return (
    <button
      onClick={handleSignIn} // 4. Attach the handler to the button's onClick event
      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
    >
      <GoogleLogo />
      <span className="ml-2">Continue with Google</span>
    </button>
  );
}
