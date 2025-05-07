import React, { useEffect } from "react";
import DataTable, { ExpanderComponentProps, TableColumn } from "react-data-table-component";
import useUserRoles from "@/hooks/useUserRoles";
import { useDeleteMaintenanceRequest } from "@/hooks/UseQueriesMaintenance";
import { statuses as statusesData } from "../data/data";
import Modal from "@/components/Modal";
import ContentModal from "./ContentModal";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DataTableConsolidadoMobile({ dataConDiasTranscurridos }: any) {
  const es = new Intl.DateTimeFormat("es-ES", {
    hour: "numeric",
    hour12: false,
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "America/Santiago",
  });
  const esOnlyDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "America/Santiago",
  });

  // delete item
  const { mutate: deleteMaintenanceRequest, isPending, isError, isSuccess } = useDeleteMaintenanceRequest();

  const { isAllowed } = useUserRoles([3, 4, 7, 8]);

  const handleDelete = async (data: any) => {
    if (isPending) return;
    const confirmDelete = window.confirm(`¿Estás seguro de eliminar la solicitud de mantención ${data.folio}?`);

    if (!confirmDelete) {
      return;
    }

    deleteMaintenanceRequest(Number(data.id));
  };

  // extenter el componente para mostrar los detalles
  const ExpandedComponent: React.FC<ExpanderComponentProps<any>> = ({ data }) => {
    const dates = (data as any).estimatedSolutions;
    const hasMultipleEstimatedDates = dates.length > 1;

    const status = statusesData.find((status) => status.value === data.status);

    return (
      <div className="text-xs font-semibold ">
        <div className="flex justify-center text-lg font-semibold p-2">
          Esta visualizando el folio: <span className="text-[#284893] font-bold ml-2">{data.folio}</span>
        </div>
        <div className="grid grid-cols-2">
          <div className="p-2 border col-span-2">
            <div className="flex justify-center gap-2">
              <Modal
                className="w-full md:w-2/3 lg:w-1/2 justify-end" // Cambiado a w-2/3 y w-1/2
                trigger={
                  <Button
                    size="sm"
                    variant="ghost"
                  >
                    <Eye /> Ver detalles
                  </Button>
                }
                data={data}
              >
                <ContentModal setOpen={() => {}} />
              </Modal>

              {isAllowed && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    handleDelete(data);
                  }}
                  className="hover:bg-slate-100"
                  disabled={isPending}
                >
                  <Trash2 /> Eliminar
                </Button>
              )}
            </div>
          </div>

          <div className="p-2 border">Folio</div>
          <div className="p-2 border">{data.folio}</div>
          <div className="p-2 border">Nombre del Equipo</div>
          <div className="p-2 border">{data.equipment?.name}</div>
          <div className="p-2 border">equipment.subarea</div>
          <div className="p-2 border">{data.equipment.subarea}</div>
          <div className="p-2 border">Tipo de Requerimiento</div>
          <div className="p-2 border">{data.faultType}</div>
          <div className="p-2 border">Fecha de Ingreso</div>
          <div className="p-2 border">{es.format(new Date(data.createdAt))}</div>
          <div className="p-2 border">Instalación</div>
          <div className="p-2 border">{data.ship.name}</div>
          <div className="p-2 border">Resposable:</div>
          <div className="p-2 border">{data.responsible ? data.responsible.name : "N/A"}</div>
          <div className="p-2 border">Estado</div>
          <div className="p-2 border flex ">
            {status?.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
            <span>{status?.label}</span>
          </div>
          <div className="p-2 border">Dias Requerimiento</div>
          <div className="p-2 border">{(data.diasTranscurridos as number).toString()}</div>
          <div className="p-2 border">Fecha Estimada</div>
          <div className="p-2 border">{hasMultipleEstimatedDates ? JSON.stringify(hasMultipleEstimatedDates, null, 2) : "N/A"}</div>
        </div>
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </div>
    );
  };

  const columnsMobile: TableColumn<any>[] = [
    {
      name: "Folio",
      selector: (row: any) => row.folio,
      sortable: true,
      maxWidth: "20px",
    },
    {
      name: "Nombre del Equipo",
      selector: (row: any) => row.equipment.name,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      sortable: true,
    },
  ];

  useEffect(() => {
    if (isError) {
      toast.error("Error al eliminar la solicitud de mantención");
    } else if (isSuccess && !isError) {
      toast.success("Solicitud de mantención eliminada correctamente");
    }
  }, [isError, isSuccess]);
  return (
    <div>
      <DataTable
        columns={columnsMobile}
        data={dataConDiasTranscurridos}
        expandableRows
        expandableRowsComponent={ExpandedComponent}
        striped
      />
    </div>
  );
}
