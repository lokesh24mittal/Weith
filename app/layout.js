import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

export const metadata = {
  title: "Welth",
  description: "Ome Stop Finance Platform",
};
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* header */}
          <Header />
          {/* main */}
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />

          {/* footer */}
          <footer className="bg-blue-50 py-12 ">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made By Lokesh Mittal</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
