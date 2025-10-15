import FigmaLogo from './FigmaLogo';
import GoogleSignInButton from './GoogleSignInButton';
import OrDivider from './OrDivider';
import LoginForm from './LoginForm';

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
            <a href="#" className="block text-sm text-blue-600 hover:underline">
              Reset password
            </a>
            <p className="text-sm text-gray-600">
              No account? <a href="#" className="text-blue-600 hover:underline">Create one</a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Link */}
      <footer className="absolute bottom-8 w-full text-center">
        <a href="#" className="text-sm text-gray-500 hover:underline">
          Manage cookies or opt out
        </a>
      </footer>
    </div>
  );
}

