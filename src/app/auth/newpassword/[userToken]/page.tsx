// En tu archivo Page.tsx o el componente relevante

import React from "react";
import { PasswordForm } from "@/components/PasswordForm"; // Asegúrate de ajustar la ruta de importación
import { verifyUserToken } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: { userToken: string };
}) {
  const tokenIsValid = await verifyUserToken(params.userToken);
  return (
    <div
      className="relative h-screen bg-no-repeat bg-cover "
      style={{ backgroundImage: "url('/Home.png')" }}
    >
      {/* Logo en la esquina superior izquierda */}
      {/* <div className="absolute inset-x-0 top-0 mt-8 flex justify-center lg:left-0 lg:m-16 lg:justify-start">
        <Image src="/sotex-logo.png" width={230} height={230} alt="Logo" />
      </div> */}

      {/* Enlace en la esquina inferior derecha */}
      <div className="absolute bottom-0 right-0 m-6 text-white font-bold">
        <Link target="_blank" href="https://sotex.cl">
          <p>Sotex</p>
        </Link>
      </div>
      {/* Barra al final de la página */}
      <div
        className={`absolute bottom-0 w-full  h-16 -z-10 hidden xl:block`}
        id="barra"
      ></div>

      {tokenIsValid ? (
        tokenIsValid.used ? (
          <h1 className=" flex flex-col items-center justify-center text-4xl font-bold text-white">
            Token ya utilizado
          </h1>
        ) : (
          <PasswordForm {...params} />
        )
      ) : (
        <h1 className=" flex flex-col items-center justify-center text-4xl font-bold text-white ">
          Token inválido
        </h1>
      )}
    </div>
  );
}
