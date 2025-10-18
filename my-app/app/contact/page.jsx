
import Link from 'next/link';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Market-IQ</div>
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4">Home</Link>
          <Link href="/top-gainers" className="mr-4">Top Gainers</Link>
          <Link href="/contact" className="mr-4">Contact Us</Link>
        </div>
      </nav>
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
        <p>This page is under construction.</p>
      </main>
    </div>
  );
}
