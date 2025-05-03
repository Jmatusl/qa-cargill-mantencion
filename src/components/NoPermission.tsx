import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NoPermission = () => {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    if (countdown === 0) {
      router.push("/dashboard/mantencion");
    } else {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer); // Limpia el temporizador al desmontar el componente o reiniciar el efecto
    }
  }, [countdown]);

  return (
    <div className="bg-white p-2 text-black text-xl font-semibold rounded shadow text-center mt-4">
      <p>No tienes permisos</p>
      <p className="mt-4">Serás redirigido en {countdown}...</p>
    </div>
  );
};

export default NoPermission;
