// ConfirmAlert.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface ConfirmAlertProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmAlert: React.FC<ConfirmAlertProps> = ({ onConfirm, onCancel }) => {
  const handleSave = () => {
    const confirmed = window.confirm("¿Estás seguro que deseas guardar los cambios?");
    if (confirmed) {
      onConfirm();
    } else {
      onCancel();
    }
  };

  return (
    <Button
      type="button"
      onClick={handleSave}
      className="bg-blue-500 text-white hover:bg-blue-600 transition-colors"
    >
      Guardar
    </Button>
  );
};

export default ConfirmAlert;
