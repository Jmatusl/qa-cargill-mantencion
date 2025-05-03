import * as React from "react";
import {
  useGetActionTakenLogs,
  useAddActionTakenLog,
  useDeleteActionTakenLog,
} from "@/hooks/UseQueriesMaintenance";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
  TrashIcon,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ActionsTakenLog } from "@/types/MaintenanceRequestType";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime24 } from "../../../../../utils/dateUtils";

interface CarouselSpacingProps {
  solicitudId: number;
  equipo: string;
  shipName: string;
  shipId: number;
  userId: number;
  userName: string;
  isAddActionsComment: boolean;
}

export function CarouselSpacing({
  solicitudId,
  equipo,
  shipName,
  shipId,
  userId,
  userName,
  isAddActionsComment,
}: CarouselSpacingProps) {
  const { data: logs, isLoading, error } = useGetActionTakenLogs(solicitudId);
  const [comentario, setComentario] = React.useState("");
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const updateState = React.useCallback(() => {
    if (api) {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
    }
  }, [api]);

  React.useEffect(() => {
    if (!api) return;

    updateState();

    // Escuchar eventos del carrusel
    api.on("slidesChanged", updateState);
    api.on("scroll", updateState);

    return () => {
      api.off("slidesChanged", updateState);
      api.off("scroll", updateState);
    };
  }, [api, updateState]);

  const {
    mutate: addActionLog,
    isSuccess: isAddLogSuccess,
    isPending: isAddLogPending,
  } = useAddActionTakenLog(solicitudId);

  const {
    mutate: deleteActionLog,
    isError: isDeleteLogError,
    isSuccess: isDeleteLogSuccess,
    isPending: isDeleteLogPending,
  } = useDeleteActionTakenLog(solicitudId, current);

  React.useEffect(() => {
    if (isAddLogSuccess) {
      setComentario("");
      toast.success("Acción registrada correctamente");
    }
  }, [isAddLogSuccess]);

  React.useEffect(() => {
    if (isDeleteLogSuccess) {
      toast.success("Registro eliminado correctamente");
    }
    if (isDeleteLogError) {
      toast.error("Error al eliminar el registro");
    }
  }, [isDeleteLogSuccess, isDeleteLogError]);

  const handleAddLog = () => {
    if (!userId || !userName) {
      console.error("Información del usuario no proporcionada");
      return;
    }

    if (!comentario.trim()) {
      toast.info("Debes ingresar un comentario");
      return;
    }

    const newLog: Omit<ActionsTakenLog, "id"> = {
      comentario,
      equipo,
      fecha: new Date(),
      userId,
      user: userName || "Usuario desconocido",
      shipName,
      shipId,
    };

    addActionLog(newLog);
  };

  const handleDeleteLog = (logId: number) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el registro ${logId}?`
      )
    ) {
      deleteActionLog({ id: solicitudId, logId });
    }
  };

  const handleScroll = (direccion: string) => {
    if (!api) return;
    direccion === "up" ? api.scrollPrev() : api.scrollNext();
  };

  return (
    <div className="w-full">
      {isAddActionsComment && (
        <div className="p-4 bg-gray-50 rounded-md shadow-sm mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold p-2">
              Ingreso de Acciones Realizadas
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <Textarea
              placeholder="Escribe un comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="flex-grow p-2"
              disabled={isAddLogPending}
              rows={2}
            />
            <Button
              type="button"
              disabled={isAddLogPending}
              onClick={handleAddLog}
              className="self-start"
            >
              {isAddLogPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                "Agregar"
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="flex align-middle justify-between">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-semibold mb-1 p-2">
            Bitacora de Acciones Realizadas
          </Label>
          <div className="py-2 text-center text-sm text-muted-foreground">
            {current} de {count}
          </div>
        </div>
        <div className="flex items-center space-x-2 p-1">
          <Button
            type="button"
            disabled={current === 1}
            onClick={() => handleScroll("up")}
            variant="outline"
            size="icon"
          >
            <ChevronUpIcon className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            disabled={current === count}
            onClick={() => handleScroll("down")}
            variant="outline"
            size="icon"
          >
            <ChevronDownIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {logs?.actionsTakenlog && logs.actionsTakenlog.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
          }}
          setApi={setApi}
          className="w-full border-t border-gray-200 rounded-md"
          orientation="vertical"
        >
          <CarouselContent className="mt-2 max-h-[200px] space-y-1">
            {logs.actionsTakenlog.map((log) => (
              <CarouselItem key={log.id} className="p1 md:basis-1/4">
                <div className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">{`Registro Número: ${log.id}`}</span>
                    {isAddActionsComment && (
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={isDeleteLogPending}
                        type="button"
                      >
                        <TrashIcon
                          className={`h-4 w-4 text-red-500 ${
                            isDeleteLogPending
                              ? "animate-spin"
                              : "cursor-pointer"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{log.user}</span>
                    <span className="text-sm text-gray-500">
                      <span className="text-blue-500">🕒</span>{" "}
                      {formatTime24(new Date(log.fecha))} -{" "}
                      {new Date(log.fecha).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-md line-clamp-2">{log.comentario}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : isLoading ? (
        /*   <div className="flex justify-center items-center">
          <Loader2Icon className="h-5 w-5 animate-spin" />
          <span className="ml-2">Cargando logs...</span>
        </div> */
        <div className="mt-4 space-y-4">
          {/* Skeleton para carga */}
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className="w-full h-16 rounded-md bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No hay registros disponibles.
        </div>
      )}
    </div>
  );
}
