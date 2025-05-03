// components/FormActions.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editButtons: boolean;
  isPending: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  setOpen,
  editButtons,
  isPending,
}) => (
  <div className="flex justify-between py-4">
    <Button
      type="button"
      variant="outline"
      className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
      onClick={() => setOpen(false)}
    >
      {editButtons ? "Cancelar" : "Cerrar"}
    </Button>
    {editButtons && (
      <Button
        type="submit"
        disabled={isPending}
        className="bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        Guardar
      </Button>
    )}
  </div>
);

// Memorizar el componente para evitar renders innecesarios
export default React.memo(FormActions);
