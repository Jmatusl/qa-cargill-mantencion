// components/OverdueAlert.tsx
import React from "react";

const OverdueAlert: React.FC = () => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
    role="alert"
  >
    <strong className="font-bold">¡Atención!</strong>
    <span className="block sm:inline">
      {" "}
      El plazo se ha agotado, pero el requerimiento sigue en proceso.
    </span>
  </div>
);

export default OverdueAlert;
