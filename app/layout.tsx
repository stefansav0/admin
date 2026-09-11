import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ✅ Import the Providers and Logout component
import { Providers } from "./Providers"; 
import LogoutButton from "../components/LogoutButton"; // Adjust path if you saved it elsewhere

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finderight Admin", // Updated to reflect your admin panel
  description: "Secure admin dashboard for Finderight",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        {/* ✅ Wrap the entire app in the Session Provider */}
        <Providers>
          
          {/* ✅ Simple Top Navbar for the Logout Button */}
          <header className="flex justify-end items-center p-4 bg-white border-b border-slate-200 shadow-sm">
            <LogoutButton />
          </header>

          {/* ✅ Main Page Content */}
          <main className="p-4 md:p-8">
            {children}
          </main>
          
        </Providers>
      </body>
    </html>
  );
}