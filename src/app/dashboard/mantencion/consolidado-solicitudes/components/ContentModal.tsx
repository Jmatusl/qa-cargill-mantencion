import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { format, addDays, differenceInDays } from "date-fns";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  MaintenanceRequest,
  Equipment,
  EstimatedSolution,
  Responsible,
  User,
  Ships,
} from "@prisma/client";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ClockIcon, Wrench, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import FormFields from "./FormFields";
import OverdueAlert from "./OverdueAlert";
import SolutionDates from "./SolutionDates";
import SolutionDateInputs from "./SolutionDateInputs";
import DescriptionField from "./DescriptionField";
import ActionsSection from "./ActionsSection";
import FormActions from "./FormActions";
import { NotificationsTab } from "./NotificationsTab";
import BatteryMeter from "./BatteryMeter";

import useUserRoles from "@/hooks/useUserRoles";
import {
  useUpdateMaintenanceRequest,
  useGetResponsibles,
} from "@/hooks/UseQueriesMaintenance";
import { Button } from "@/components/ui/button";

interface UserMaintenance {
  user: User;
  maintenanceRequestId: number;
  userId: number;
}

interface MaintenanceRequestFormProps extends MaintenanceRequest {
  equipment: Equipment;
  responsible: Responsible;
  users: UserMaintenance[];
  estimatedSolutions?: EstimatedSolution[];
  realSolution: Date | null;
  ship: Ships;
  photos: { id: number; url: string }[];
}

interface SimpleResponsible {
  id: number;
  name: string;
}

interface Props {
  data?: MaintenanceRequestFormProps;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const calculateProgressPercentage = (
  startDate: Date,
  endDate: Date,
  currentDate: Date,
  status: string
): { percentage: number; isOverdue: boolean } => {
  if (status === "COMPLETADO") {
    return { percentage: 100, isOverdue: false };
  }

  if (currentDate <= startDate) {
    return { percentage: 0, isOverdue: false };
  }

  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = currentDate.getTime() - startDate.getTime();

  const rawPercentage = Math.min(
    100,
    Math.max(0, (elapsed / totalDuration) * 100)
  );

  const isOverdue = rawPercentage >= 100;

  return { percentage: rawPercentage, isOverdue };
};

const MaintenanceRequestForm: React.FC<Props> = ({ data, setOpen }) => {
  const [isAddActionsComment, setIsAddActionsComment] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);
  const [newSolutionDates, setNewSolutionDates] = useState<string[]>([]);
  const [dateAdded, setDateAdded] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [showPreviousDates, setShowPreviousDates] = useState(false);
  const [showEstimatedDates, setShowEstimatedDates] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const photos = data?.photos ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    control,
  } = useForm<MaintenanceRequestFormProps>({
    defaultValues: {
      description: data?.description || "",
      actionsTaken: data?.actionsTaken || "",
      faultType: data?.faultType || "",
      status: data?.status || "",
      responsible: data?.responsible || undefined,
      responsibleId: data?.responsibleId || 0,
      estimatedSolutions: data?.estimatedSolutions || [],
      realSolution: data?.realSolution || null,
    },
  });

  const {
    data: responsiblesList = [],
    isLoading: isLoadingResponsibles,
    isError: isErrorResponsibles,
  } = useGetResponsibles();

  useEffect(() => {
    if (isErrorResponsibles) {
      toast.error("Error al cargar la lista de responsables");
    }
  }, [isErrorResponsibles]);

  const {
    mutate: updateMaintenanceRequest,
    isPending: isPendingUpdateMaintenanceRequest,
    isError: isErrorUpdateMaintenanceRequest,
    isSuccess: isSuccessUpdateMaintenanceRequest,
  } = useUpdateMaintenanceRequest();

  const { data: session } = useSession();
  const userData = session?.user as User;
  const userId = userData?.id || 0;
  const userName = userData?.username || "Usuario desconocido";

  useEffect(() => {
    if (isSuccessUpdateMaintenanceRequest) {
      setOpen(false);
    } else if (isErrorUpdateMaintenanceRequest) {
      toast.error("Error al actualizar la solicitud de mantenimiento");
    }
  }, [
    isSuccessUpdateMaintenanceRequest,
    setOpen,
    isErrorUpdateMaintenanceRequest,
  ]);

  const { isAllowed: editButtons } = useUserRoles([3, 4, 7, 8]);

  const addSolutionDate = () => {
    const totalDates =
      (data?.estimatedSolutions?.length || 0) + newSolutionDates.length;

    if (
      totalDates < 3 &&
      watch("status") !== "COMPLETADO" &&
      watch("status") !== "CANCELADO"
    ) {
      setNewSolutionDates((prev) => [...prev, ""]);

      if (watch("status") === "SOLICITADO") {
        setValue("status", "EN_PROCESO");
      }

      setDateAdded(true);
    }
  };

  const entryDate = new Date();
  const lastEstimatedSolution = data?.estimatedSolutions?.[0] ?? null;

  const daysRemainingNumber = lastEstimatedSolution?.date
    ? Math.max(
      0,
      differenceInDays(new Date(lastEstimatedSolution.date), entryDate)
    )
    : 0;

  const plazo = lastEstimatedSolution?.date
    ? `${daysRemainingNumber} Días`
    : "Fecha no fijada";

  useEffect(() => {
    if (data?.status === "SOLICITADO" && data?.createdAt) {
      const estimatedDate = addDays(new Date(data.createdAt), 7);
      setValue("estimatedSolutions.0.date", estimatedDate);
    }
  }, [data, setValue]);

  const onSubmit = (formData: MaintenanceRequestFormProps) => {
    const parsedNewSolutionDates = newSolutionDates
      .filter((date) => date && !isNaN(new Date(date).getTime()))
      .map((date) => ({
        date: new Date(`${date}T23:59:59.999Z`),
        comment: "Estimación agregada desde el formulario",
      }));

    const updateData = {
      id: data?.id ?? 0,
      status: formData.status,
      actionsTaken: formData.actionsTaken ?? "",
      faultType: formData.faultType,
      description: formData.description,
      responsibleId: formData.responsibleId,
      ...(parsedNewSolutionDates.length > 0 && {
        estimatedSolutions: parsedNewSolutionDates,
      }),
    };

    if (window.confirm("¿Estás seguro que deseas guardar los cambios?")) {
      updateMaintenanceRequest(updateData as any);
    }
  };

  useEffect(() => {
    if (data?.status === "COMPLETADO") {
      setProgressPercentage(100);
      setIsOverdue(false);
      const elapsed = data.realSolution
        ? differenceInDays(new Date(data.realSolution), new Date(data.createdAt))
        : 0;
      setDaysElapsed(elapsed);
      setDaysRemaining(0);
    } else if (data?.createdAt && data?.estimatedSolutions?.length) {
      const startDate = new Date(data.createdAt);
      const lastSolutionDate = new Date(data.estimatedSolutions[0].date);
      const currentDate = new Date();

      const { percentage, isOverdue } = calculateProgressPercentage(
        startDate,
        lastSolutionDate,
        currentDate,
        data.status
      );

      setProgressPercentage(percentage);
      setIsOverdue(isOverdue);

      const elapsedDays = differenceInDays(currentDate, startDate);
      setDaysElapsed(elapsedDays);

      setDaysRemaining(daysRemainingNumber);
    }
  }, [data, daysRemainingNumber]);

  const estimatedSolutionDates = useMemo(() => {
    return data?.estimatedSolutions
      ? data.estimatedSolutions.map((es) => new Date(es.date))
      : [];
  }, [data?.estimatedSolutions]);

  return (
    <Card className="w-full max-w-8xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 md:p-6">
        <DialogTitle className="text-xl md:text-2xl font-bold">
          {`${editButtons ? "Editar" : "Ver"} Solicitud de Mantención ${data?.folio
            }`}
        </DialogTitle>
        <DialogDescription className="text-blue-100 mt-2">
          <ClockIcon className="inline-block mr-2 h-4 w-4" />
          {`Última actualización: ${format(
            new Date(data?.updatedAt ?? ""),
            "dd/MM/yyyy HH:mm"
          )} por ${data?.users[data?.users.length - 1]?.user?.username}`}
        </DialogDescription>
        <DialogDescription className="text-blue-100 mt-2">
          <Wrench className="inline-block mr-2 h-4 w-4" />
          {`${data?.ship.name} - ${data?.equipment.name} - ${data?.equipment.subarea}`}
        </DialogDescription>


      </CardHeader>
      <Tabs defaultValue="solicitud">
        <TabsList className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mb-6">
          <TabsTrigger
            value="solicitud"
            className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
          >
            Datos de la Solicitud
          </TabsTrigger>
          {data && (
            <TabsTrigger
              value="notificaciones"
              className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              Notificaciones
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="solicitud">
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormFields
                data={data}
                watch={watch}
                register={register}
                setValue={setValue}
                errors={errors}
                responsiblesList={responsiblesList}
                editButtons={editButtons}
                control={control}
              />
              {photos.length > 0 && (
                <div className="mt-4 text-center">
                  <Button
                    type="button"
                    className="inline-flex items-center space-x-2 bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => setShowPhoto((prev) => !prev)}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>{showPhoto ? "Ocultar fotos" : `Mostrar fotos (${photos.length})`}</span>
                  </Button>
                  {showPhoto && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {photos.map((photo) => (
                        <div key={photo.id} className="border rounded overflow-hidden">
                          <img
                            src={photo.url}
                            alt={`Foto ${photo.id}`}
                            className="w-full h-32 object-cover cursor-pointer"
                            onClick={() => window.open(photo.url, "_blank")}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Separator className="my-6" />
              {isOverdue && <OverdueAlert />}

              <BatteryMeter
                percentage={progressPercentage}
                daysElapsed={daysElapsed}
                daysRemaining={daysRemaining}
              />
              <SolutionDates
                createdAt={data?.createdAt || ""}
                realSolution={data?.realSolution}
                estimatedSolutionDates={estimatedSolutionDates}
                data={data}
                showPreviousDates={showPreviousDates}
                setShowPreviousDates={setShowPreviousDates}
                showEstimatedDates={showEstimatedDates}
                setShowEstimatedDates={setShowEstimatedDates}
              />
              <SolutionDateInputs
                newSolutionDates={newSolutionDates}
                setNewSolutionDates={setNewSolutionDates}
                addSolutionDate={addSolutionDate}
                editButtons={editButtons}
                data={data}
                dateAdded={dateAdded}
                control={control}
              />
              <DescriptionField
                register={register}
                errors={errors}
                description={data?.description}
              />
              <ActionsSection
                isAddActionsComment={isAddActionsComment}
                setIsAddActionsComment={setIsAddActionsComment}
                editButtons={editButtons}
                data={data}
                userId={userId}
                userName={userName}
              />
              <FormActions
                setOpen={setOpen}
                editButtons={editButtons}
                isPending={isPendingUpdateMaintenanceRequest}
              />

            </form>
          </CardContent>
        </TabsContent>
        <TabsContent value="notificaciones">
          <NotificationsTab data={data} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default MaintenanceRequestForm;
