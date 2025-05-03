import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// Hooks de queries (ajusta las rutas a tu proyecto)
import { useCreateMaintenanceRequest } from "@/hooks/UseQueriesMaintenance";
import {
  useGetAreaListByShip,
  useGetEquipmentListByShip, // <--- ya NO recibe 'subarea' como parámetro
} from "@/hooks/useQueriesEquipment";
import { useShipsQuery } from "@/hooks/useShipsQuery";
import useUserRoles from "@/hooks/useUserRoles";


interface Role {
  id: number;
  name: string;
  description?: string;
}

interface UserRole {
  userId: number;
  roleId: number;
  role: Role;
}

interface ExtendedUser {
  id: number;
  username?: string;
  roles?: Array<{
    role: {
      name: string;
    };
  }>;
}

const allowedRoles = [3, 6, 7, 8, 4, 9, 10, 11, 12, 13, 14];

export default function useMaintenanceRequest({
  reset,
  setValue,
  clearErrors,
  watch,
  resetField,
}: {
  reset: any;
  setValue: any;
  clearErrors: any;
  watch: any;
  resetField: any;
}) {
  // Session / usuario
  const { data: session, status } = useSession();
  const userData = ((status === "authenticated" && session?.user) || null) as ExtendedUser || null;


  // Estados de selección
  const [selectedShip, setSelectedShip] = useState<any | null>(null);
  const [selectedSubarea, setSelectedSubarea] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<any | null>(null);

  // Otros estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [rol, setRol] = useState<string | null>(null);
  const [descriptionLength, setDescriptionLength] = useState(0);

  // Mutation (crear solicitud)
  const {
    mutate: createMaintenanceRequest,
    isError: mutateError,
    isPending: isCreating,
    isSuccess: isCreated,
  } = useCreateMaintenanceRequest();

  // Obtener barcos
  const {
    data: ships,
    isFetching: shipsLoading,
    isError: shipsError,
  } = useShipsQuery();

  // Obtener todas las subáreas del barco
  const {
    data: subAreas,
    isFetching: subAreasLoading,
    isError: subAreasError,
  } = useGetAreaListByShip(selectedShip?.id);

  // Obtener todos los equipos del barco (sin filtrar por subárea)
  const {
    data: equipments,
    isFetching: equipmentsLoading,
    isError: equipmentsError,
  } = useGetEquipmentListByShip(selectedShip?.id);

  // Roles permitidos
  const { isAllowed } = useUserRoles(allowedRoles);

  // Control de estado "cargando"
  useEffect(() => {
    setIsFetching(
      shipsLoading || equipmentsLoading || subAreasLoading || isCreating
    );
  }, [shipsLoading, equipmentsLoading, subAreasLoading, isCreating]);

  // Si el usuario es "NAVE", le asignamos el barco por su username.
  useEffect(() => {
    if (userData && ships?.length) {
      // Este ejemplo asume que userData.username coincide con ship.name
      const shipFound = ships.find(
        (ship) => ship.name === userData.username
      );
      if (shipFound) {
        setSelectedShip(shipFound);
        setValue("shipId", shipFound.id);
      }
    }
  }, [userData, ships, setValue]);

  // Determinar rol ADMIN o NAVE
  useEffect(() => {
    if (userData) {
      const isNave = (userData.roles as UserRole[])?.some(
        (userRole) => userRole.role.name === "INSTALACION"
      );

      const adminRoles = [
        "ADMIN",
        "GERENCIA",
        "JEFE1",
        "JEFE2",
      ];

      const isAdmin = (userData.roles as UserRole[])?.some((userRole: UserRole) =>
        adminRoles.includes(userRole.role.name)
      );
      if (isAdmin) setRol("ADMIN");
      else if (isNave) setRol("INSTALACION");
    }
  }, [userData]);

  // Longitud descripción
  const description = watch("description");
  useEffect(() => {
    setDescriptionLength(description?.length ?? 0);
  }, [description]);

  // Limpiar y notificar si se crea la solicitud
  useEffect(() => {
    if (isCreated) {
      setSelectedEquipment(null);
      setSelectedSubarea(null);

      // Resetea campos, conserva el shipId
      reset({
        shipId: selectedShip?.id || null,
        subarea: "",
        equipment: "",
        faultType: "",
        description: "",
      });
      resetField("description");
      resetField("equipment");
      resetField("faultType");
      resetField("subarea");

      toast.success("Solicitud de mantención creada correctamente");
    } else if (mutateError) {
      toast.error("Error al enviar solicitud de mantención");
    }
  }, [isCreated, mutateError, reset, selectedShip, clearErrors, resetField]);

  // Cuando se seleccione un equipo con extra info, abre modal si aplica
  useEffect(() => {
    setIsModalOpen(!!selectedEquipment?.extra);
  }, [selectedEquipment]);

  // Manejo de subárea
  const handleSubareaChange = (subarea: string) => {
    setSelectedSubarea(subarea);
    // setSelectedEquipment(null);
  };

  // Manejo de equipo
  const handleEquipmentChange = (equipmentId: string) => {
    const eq = equipments?.find(
      (equipment) => equipment.id === parseInt(equipmentId, 10)
    );
    if (eq) {
      setSelectedEquipment(eq);
      setValue("equipment_id", eq.id);
      setValue("responsibleId", eq.responsibleId || 0);

      // Fuerza el subarea igual al del equipo
      setValue("subarea", eq.subarea);
      setSelectedSubarea(eq.subarea);
    }
  };




  // Filtrado local de subáreas en caso de que el usuario seleccione primero el equipo
  // (en tu modelo, Equipment tiene un solo `subarea`. Si de verdad un equipo puede tener varias subáreas,
  //  se requeriría un esquema distinto, pero te muestro la idea).
  const filteredSubAreas = useMemo(() => {
    if (!subAreas) return [];
    if (!selectedEquipment) return subAreas; // No filtra si no hay equipo seleccionado

    // Filtrar subáreas basadas en las propiedades del equipo seleccionado
    return subAreas.filter((sa: any) => {
      const equipmentMatches = [
        selectedEquipment.name,
        selectedEquipment.model,
        selectedEquipment.serial,
        selectedEquipment.subarea, // Considerar subarea explícita
      ].some((property) => property && property === sa.subarea);
      return equipmentMatches;
    });
  }, [subAreas, selectedEquipment]);

  const filteredEquipments = useMemo(() => {
    if (!equipments) return [];
    if (!selectedSubarea) return equipments; // No filtra si no hay subárea seleccionada

    // Filtrar equipos basados en la subárea seleccionada
    return equipments.filter((eq: any) => {
      const subareaMatches = [
        eq.name,
        eq.model,
        eq.serial,
        eq.subarea, // Considerar subarea explícita
      ].some((property) => property && property === selectedSubarea);
      return subareaMatches;
    });
  }, [equipments, selectedSubarea]);



  return {
    // Data
    ships,
    subAreas, // te puede servir si aún deseas verlas sin filtrar
    equipments, // idem
    filteredSubAreas,
    filteredEquipments,

    // Estados
    userData,
    isFetching,
    isCreated,
    mutateError,
    isCreating,
    shipsError,
    subAreasError,
    equipmentsError,
    shipsLoading,
    subAreasLoading,
    equipmentsLoading,
    selectedShip,
    selectedSubarea,
    selectedEquipment,
    isModalOpen,
    rol,
    isAllowed,
    descriptionLength,

    // Setters & Handlers
    setSelectedSubarea,
    setSelectedShip,
    setSelectedEquipment,
    setIsModalOpen,
    createMaintenanceRequest,
    handleSubareaChange,
    handleEquipmentChange,
  };
}
