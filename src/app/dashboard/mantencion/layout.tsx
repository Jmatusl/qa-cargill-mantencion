// app/layout.tsx

"use client";

import React, { useEffect, useState } from "react";
import useWindowSize from "@/hooks/useWindowSize";
import { AsideMantencion } from "./components/Mantenimiento-Aside";
import { Navbar } from "@/components/Navbar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMovil, setIsMovil] = useState(false);
  const [width] = useWindowSize();

  useEffect(() => setIsMovil(width < 600), [width]);

  // Calcular posición horizontal para centrar el botón a la mitad del borde
  const buttonLeft = isMenuOpen ? 'calc(18rem - 1.25rem)' : 'calc(90px - 1.25rem)';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="relative flex flex-1 overflow-hidden">
        {!isMovil && (
          <div
            className={
              `flex-shrink-0 transition-[width] duration-300 ease-in-out ${
                isMenuOpen ? "w-72" : "w-[90px]"
              }`
            }
          >
            <AsideMantencion isOpen={isMenuOpen} />
          </div>
        )}

        {!isMovil && (
          <button
            onClick={() => setIsMenuOpen((o) => !o)}
            style={{ left: buttonLeft }}
            className="absolute top-3 w-10 h-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-center z-10 transition-[left] duration-300 ease-in-out"
          >
            {isMenuOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>

      <footer className="bg-gray-100 dark:bg-gray-900 p-4 md:p-6 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="https://sotex.cl"
            target="_blank"
            className="hover:underline"
          >
            ©2024 Sotex.cl
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-sm hover:underline dark:text-gray-400">
            Términos de servicio
          </Link>
          <Link href="#" className="text-sm hover:underline dark:text-gray-400">
            Privacidad
          </Link>
        </div>
      </footer>
    </div>
  );
}
