import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarComponent } from "@/components/SidebarComponent";
import { Toaster } from 'react-hot-toast'; // Add this import
import Mentorbot from "@/components/Mentorbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learnify",
  description: "Curate Top Resources for Learning",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Safety check for missing publishable key during build
  if (!publishableKey) {
    console.warn('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing');
    // Return basic layout without Clerk during build/prerendering
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Configuration Required</h1>
              <p>Clerk configuration is missing. Please check your environment variables.</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SidebarComponent isLoading={false}>
            <div className="relative flex h-screen w-full overflow-hidden bg-slate-950">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
              {/* Scrollable Content */}
              <div className="relative flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </SidebarComponent>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937', // Dark gray to match your theme
                color: '#fff',
                border: '1px solid #374151',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981', // Green color for success
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444', // Red color for error
                  secondary: '#fff',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#8b5cf6', // Purple color for loading
                  secondary: '#fff',
                },
              },
            }}
          />
          <Mentorbot />
        </body>
      </html>
    </ClerkProvider>
  );
}