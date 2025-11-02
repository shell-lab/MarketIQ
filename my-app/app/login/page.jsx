import FigmaLogo from './FigmaLogo';
import GoogleSignInButton from './GoogleSignInButton';
import OrDivider from './OrDivider';
import LoginForm from './LoginForm';
import Link from 'next/link';


export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-white font-sans">
      {/* Figma Logo in the top-left corner */}
      <div className="absolute top-8 left-8">
        <FigmaLogo />
      </div>

      <main className="flex flex-col items-center justify-center min-h-screen py-12">
        <div className="w-full max-w-sm px-4">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Sign in to Market-IQ
          </h1>

          <GoogleSignInButton />

          <OrDivider />

          <LoginForm />

          {/* Additional Links */}
          <div className="text-center mt-6 space-y-2">
            <a href="#" className="block text-sm text-blue-600 hover:underline">
              Use single sign-on
            </a>
            <Link href="/forgot-password" className="block text-sm text-blue-600 hover:underline">
              Reset password
            </Link>
            <p className="text-sm text-gray-600">
              No account? <Link href="/register" className="text-blue-600 hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Link */}
      <footer className="absolute bottom-8 w-full text-center">
        <p className="text-xs text-gray-500">
          &copy; 2025 MarketIQ. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

