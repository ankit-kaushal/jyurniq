import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jyurniq | Travel Blog Platform",
  description:
    "Your Journey, Uniquely Told. Create travel blogs, connect with travelers, and monetize your expertise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
