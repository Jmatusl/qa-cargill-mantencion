// components/ActionsSection.tsx
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CarouselSpacing } from "../../components/CarouselSpacing";

interface ActionsSectionProps {
  isAddActionsComment: boolean;
  setIsAddActionsComment: React.Dispatch<React.SetStateAction<boolean>>;
  editButtons: boolean;
  data?: any;
  userId: number;
  userName: string;
}

const ActionsSection: React.FC<ActionsSectionProps> = ({
  isAddActionsComment,
  setIsAddActionsComment,
  editButtons,
  data,
  userId,
  userName,
}) => (
  <div>
    {data?.status !== "COMPLETADO" &&
      data?.status !== "CANCELADO" &&
      editButtons && (
        <div className="flex items-center space-x-2 p-2">
          <Switch
            id="add-actions-comment"
            checked={isAddActionsComment}
            onCheckedChange={() => setIsAddActionsComment(!isAddActionsComment)}
          />
          <Label htmlFor="add-actions-comment">
            Agregar Acciones Realizadas
          </Label>
        </div>
      )}
    <CarouselSpacing
      solicitudId={data?.id || 0}
      equipo={data?.equipment.name || ""}
      shipName={data?.ship.name || ""}
      shipId={data?.ship.id || 0}
      userId={userId}
      userName={userName}
      isAddActionsComment={isAddActionsComment}
    />
  </div>
);

// Memorizar el componente para evitar renders innecesarios
export default ActionsSection;
