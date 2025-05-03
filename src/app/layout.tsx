import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";

import { Toaster } from "sonner";
import AuthProvider from "@/context/AuthProvider";
import { TanstackProvider } from "@/providers/TanstackProvider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ weight: "300", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Mantención Sotex",
  description: "Sistema de gestión de solicitudes de mantención.",
  manifest: "/manifest.json",
  icons: {
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-screen">
      <body className={roboto.className}>
        <AuthProvider>
          <TanstackProvider>{children}</TanstackProvider>
        </AuthProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
