import React from "react";
import { MantenimientoAlertas } from "./components/mantenimiento-alerts";
import { MantenimientoTabla } from "./components/mantenimiento-tabla";
import { Navbar } from "@/components/Navbar";

export default function page() {
  return (
    <div>
      <MantenimientoAlertas />
      {/* <MantenimientoTabla /> */}
    </div>
  );
}
