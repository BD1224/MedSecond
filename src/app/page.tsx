'use client';

import DNABackground from '@/components/DNABackground';
import Link from 'next/link';

/**
 * HomePage: Displays the MedSecond homepage with DNA background
 * and a call-to-action to sign in.
 */
export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <DNABackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
            MedSecond
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Secure human-reviewed medical second opinions
          </p>
          <Link
            href="/auth/sign-in"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
