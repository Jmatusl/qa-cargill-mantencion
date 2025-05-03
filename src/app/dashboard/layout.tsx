"use client";
import { Roboto } from "next/font/google";

const roboto = Roboto({ weight: "300", subsets: ["latin"], display: "swap" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`relative min-h-screen ${roboto.className}`}
      style={{ backgroundColor: "#F4F7F9" }}
    >
      <div className="flex flex-col min-h-screen backdrop-filter backdrop-blur">{children}</div>
    </div>
  );
}
