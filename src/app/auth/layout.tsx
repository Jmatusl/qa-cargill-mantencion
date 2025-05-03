"use client";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <div
        className="
        fixed
        top-0 left-0 right-0 bottom-0
        m-0 p-0
        overflow-hidden
        bg-[url('/cargill/fondo-nuevo-cargill.png')]
        bg-cover
        bg-center
        bg-no-repeat
      "
      >
        <Image
          src="/cargill/logo-cargill_blanco.png"
          alt="Río Dulce"
          className="absolute top-4 left-4 w-64 max-w-full h-auto"
          width={256}
          height={64}
        />
        {children}
      </div>
    </main>
  );
}
