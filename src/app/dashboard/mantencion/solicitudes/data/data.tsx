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
import { ShipIcon, UserIcon, Factory } from "lucide-react";

export const statuses = [
  {
    value: "SOLICITADO",
    label: "Solicitado",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "en progreso",
    label: "En Progreso",
    icon: StopwatchIcon,
  },
  {
    value: "completado",
    label: "Completado",
    icon: CheckCircledIcon,
  },
  {
    value: "cancelado",
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

