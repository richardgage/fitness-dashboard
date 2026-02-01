import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fitness Training Dashboard",
  description: "Track your workouts and monitor your progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation Bar */}
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-white text-xl font-bold hover:text-blue-400">
                Fitness Tracker
              </Link>
              <div className="flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/workouts" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Workouts
                </Link>
                <Link 
                  href="/import" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Import
                </Link>
                <Link 
                  href="/feedback" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Feedback
                </Link>

              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}