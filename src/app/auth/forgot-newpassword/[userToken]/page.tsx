// forgot-newpassword\[userToken].tsx
import React from "react";
import { PasswordForm } from "@/components/ChangePasswordForm";
import { verifyUserTokenWithEmail } from "@/lib/auth"; // Importa la nueva función
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: { userToken: string };
}

export default async function Page({ params }: PageProps) {
  const tokenData = await verifyUserTokenWithEmail(params.userToken); // Cambiado a la nueva función

  return (
    <div
      className="relative h-screen bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/Home.png')" }}
    >
      {/* Logo en la esquina superior izquierda */}
      {/* <div className="absolute inset-x-0 top-0 mt-16 flex justify-center lg:left-0 lg:m-16 lg:justify-start">
        <Image src="/sotex-logo.png" width={230} height={230} alt="Logo" />
      </div> */}

      {/* Enlace en la esquina inferior derecha */}
      <div className="absolute bottom-0 right-0 m-6 text-white font-bold ">
        <Link target="_blank" href="https://sotex.cl">
          <p>Sotex</p>
        </Link>
      </div>
      {/* Barra al final de la página */}
      <div
        className={`absolute bottom-0 w-full h-16 -z-10 hidden xl:block`}
        id="barra"
      ></div>

      {tokenData ? (
        tokenData.used ? (
          <h1 className="flex flex-col items-center justify-center text-4xl font-bold text-white">
            Token ya utilizado
          </h1>
        ) : (
          <PasswordForm userToken={params.userToken} email={tokenData.email} /> // Pasa el email aquí
        )
      ) : (
        <h1 className="flex flex-col items-center justify-center text-4xl font-bold text-white ">
          Token inválido
        </h1>
      )}
    </div>
  );
}
