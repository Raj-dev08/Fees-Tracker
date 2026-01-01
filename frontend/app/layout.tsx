import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";


export const metadata: Metadata = {
  title: "Fees Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className='antialiased'
      >
        
        <Providers>
          <Toaster position="top-right"/>
            {children}
        </Providers>
      </body>
    </html>
  );
}
