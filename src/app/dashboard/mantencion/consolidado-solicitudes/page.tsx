import { Metadata } from "next";
import { ResultTable } from "./components/ResultTable";

export const metadata: Metadata = {
  title: "Mantención | Listado de  Mantentención",
  description: "Listado de las solicitudes de mantenimiento.",
};

export default function page() {
  return (
    <div>
      <ResultTable />
    </div>
  );
}
