import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import { icon } from "leaflet";
import { ShipIcon, Factory } from "lucide-react";

export const labels = [
  {
    value: "Fisicoquímico",
    label: "Fisicoquímico",
  },
  {
    value: "Microbiológico",
    label: "Microbiológico",
  },
  {
    value: "Químico",
    label: "Químico",
  },
  {
    value: "Reológico",
    label: "Reológico",
  },
];

export const statuses = [
  {
    value: "SOLICITADO",
    label: "Solicitado",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "EN_PROCESO",
    label: "En Proceso",
    icon: StopwatchIcon,
  },
  {
    value: "COMPLETADO",
    label: "Completado",
    icon: CheckCircledIcon,
  },
  {
    value: "CANCELADO",
    label: "Cancelado",
    icon: CrossCircledIcon,
  },
];

export const priorities = [
  {
    label: "Baja",
    value: "baja",
    icon: ArrowDownIcon,
  },
  {
    label: "Media",
    value: "media",
    icon: ArrowRightIcon,
  },
  {
    label: "Alta",
    value: "alta",
    icon: ArrowUpIcon,
  },
];

export const ships = [
  {
    value: "Instalación 1",
    label: "Instalación 1",
    icon: Factory,
  },
  {
    value: "Instalación 2",
    label: "Instalación 2",
    icon: Factory,
  },
  {
    value: "Instalación 3",
    label: "Instalación 3",
    icon: Factory,
  }
];


export const faultTypes = [
  {
    value: "Ordinaria",
    label: "Falla Ordinaria",
  },
  {
    value: "Equipo",
    label: "Falla de Equipo",
  },
  { value: "Operativa", label: "Falla Operativa" },
];
