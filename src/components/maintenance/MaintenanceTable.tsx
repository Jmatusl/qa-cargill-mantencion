import { useEffect} from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import ActionButtons from "@/components/maintenance/ActionButtons";
import { toast } from "sonner";
import { format } from "date-fns";
import useMaintenanceStore from "@/store/useMaintenanceStore";


function MaintenanceTable({
  userId,
  userRole,
  open,
  setOpen
}: {
  userId: number;
  userRole: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    maintenanceRequests,
    fetchMaintenanceRequests,
    deleteMaintenanceRequest,
  } = useMaintenanceStore();

  useEffect(() => {
    fetchMaintenanceRequests();
  }, [fetchMaintenanceRequests]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este registro de Mantención?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteMaintenanceRequest(id);
      toast.success("Mantención eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el registro de Mantención:", error);
      toast.error("Error al eliminar el Mantención");
    }
  };

  const handleDaysToDeadline = (createdAt: string | number | Date, estimatedSolution: string | number | Date | undefined) => {

    if (!createdAt || !estimatedSolution) {
      return '-';
    }
    const startDate = new Date(createdAt);
    const endDate = new Date(estimatedSolution);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Fechas no válidas';
    }
    const diffInMs = endDate.getTime() - startDate.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
  };
  const handleActiveFaultDays = (createdAt: string | number | Date) => {
    if (!createdAt) {
      return 'Fecha no disponible';
    }
    const startDate = new Date(createdAt);
    if (isNaN(startDate.getTime())) {
      return 'Fecha no válida';
    }
    const currentDate = new Date();
    const diffInMs = currentDate.getTime() - startDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="overflow-x-auto">
        <Table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Acciones</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Fecha de ingreso de requerimiento</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Folio requerimiento</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Nave</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Sistema</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Equipo</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Tipo de requerimiento</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Usuario Mantención</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Días de requerimiento activo</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Fecha Estimada Solución</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Estado</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Plazo</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Fecha Estimada Solución 2</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Fecha Estimada Solución 3</TableHead>
              <TableHead className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">Solución Real</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenanceRequests.length > 0 && maintenanceRequests.map((maintenanceRequest) => (
              <TableRow key={maintenanceRequest.id} className="hover:bg-gray-100">
                <TableCell className="px-4 py-2 border-b border-gray-200">
                  <ActionButtons
                    userRole={userRole}
                    userId={userId}
                    maintenanceRequest={maintenanceRequest}
                    handleDelete={handleDelete}
                    setOpen={setOpen}
                    open={open}
                  />
                </TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{format(new Date(maintenanceRequest.createdAt), 'dd-MM-yyyy HH:mm')}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.id}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.users[0].user.username}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.systemId}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.equipmentId}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.faultType}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.assignedTo?.username ?? 'N/A'}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{handleActiveFaultDays(maintenanceRequest.createdAt)}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.estimatedSolution ? format(new Date(maintenanceRequest.estimatedSolution), 'dd-MM-yyyy') : '-'}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.status}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{handleDaysToDeadline(maintenanceRequest.createdAt, maintenanceRequest.estimatedSolution)}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.estimatedSolution2 ? format(new Date(maintenanceRequest.estimatedSolution2), 'dd-MM-yyyy') : '-'}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.estimatedSolution3 ? format(new Date(maintenanceRequest.estimatedSolution3), 'dd-MM-yyyy') : '-'}</TableCell>
                <TableCell className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{maintenanceRequest.realSolution ? format(new Date(maintenanceRequest.realSolution), 'dd-MM-yyyy') : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MaintenanceTable;
