import { Metadata } from "next";
import { z } from "zod";
import { EquipmentTable } from "./components/equipmentTable";

import { flatEquipmentSchema } from "./data/schema";
import { getFlatEquipmentList } from "@/actions/equipmentAction";

export const metadata: Metadata = {
  title: "Mantención | Listado de  Equipos",
  description: "Listado de los equipos de los barcos.",
};

// Simulate a database read for tasks.

export default async function TaskPage() {
  return <EquipmentTable />;
}
