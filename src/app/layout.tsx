import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "NutriVision | AI-Powered Personalized Nutrition & Food Intelligence",
  description: "Understand what to eat based on who you are and what you actually have at home. Available-Food-First Nutrition Intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased min-h-screen">
        <Navigation>{children}</Navigation>
      </body>
    </html>
  );
}
