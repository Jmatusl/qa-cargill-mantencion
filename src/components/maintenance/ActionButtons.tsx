import React from 'react';
import Modal from "@/components/Modal";
import { TrashIcon, EyeIcon, Pencil } from "lucide-react";
import ViewMaintenanceDetailForm from "@/components/maintenance/ViewMaintenanceDetail";
import MaintenanceDetailForm from "@/components/maintenance/NewMaintenanceDetail";
import { MaintenanceRequest } from "@/types/MaintenanceRequestType";

interface ActionButtonsProps {
  userRole: string;
  userId: number;
  maintenanceRequest: MaintenanceRequest;
  handleDelete: (id: number) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ userRole, userId, maintenanceRequest, handleDelete, open, setOpen }) => {
  return (
    <div className="flex">
      {(userRole === 'GERENTE_OOPP' || userRole === 'NAVE' || userRole === 'JEFE_AREA' || userRole === 'ADMIN') && (
        <Modal
          className="w-full md:w-1/2 lg:w-1/3 justify-end"
          trigger={
            <div><EyeIcon className="w-6 h-6 mr-2" /></div>
          }
        >
          <ViewMaintenanceDetailForm
            userId={userId}
            id={maintenanceRequest.id}
            systemId={maintenanceRequest.systemId}
            equipmentId={maintenanceRequest.equipmentId}
            faultType={maintenanceRequest.faultType}
            description={maintenanceRequest.description}
            estimatedSolution={maintenanceRequest.estimatedSolution}
            actionsTaken={maintenanceRequest.actionsTaken ?? ''}
            status={maintenanceRequest.status}
            assignedToId={maintenanceRequest.assignedToId}
            estimatedSolution2={maintenanceRequest.estimatedSolution2}
            estimatedSolution3={maintenanceRequest.estimatedSolution3}
            realSolution={maintenanceRequest.realSolution}
            userRequestId={maintenanceRequest.userRequestId}
            maintenanceUserId={undefined}

          />
        </Modal>
      )}
      {(userRole === 'MANTENCION' || userRole === 'JEFE_AREA' || userRole === 'GERENTE_OOPP' || userRole === 'ADMIN') && (
        <Modal
          className="w-full md:w-1/2 lg:w-1/3 justify-end"
          trigger={
            <div><Pencil className="w-6 h-6 mr-2" /></div>
          }
        >
          <MaintenanceDetailForm
            id={maintenanceRequest.id}
            userRole={userRole}
            userId={userId}
            systemId={maintenanceRequest.systemId}
            equipmentId={maintenanceRequest.equipmentId}
            faultType={maintenanceRequest.faultType}
            description={maintenanceRequest.description}
            estimatedSolution={maintenanceRequest.estimatedSolution}
            estimatedSolution2={maintenanceRequest.estimatedSolution2}
            estimatedSolution3={maintenanceRequest.estimatedSolution3}
            actionsTaken={maintenanceRequest.actionsTaken ?? ''}
            status={maintenanceRequest.status}
            realSolution={maintenanceRequest.realSolution}
            maintenanceUserId={undefined}
            setOpen={setOpen}
            open={open}
          />
        </Modal>
      )}
      {(userRole === 'GERENTE_OOPP' || userRole === 'JEFE_AREA' || userRole === 'ADMIN') && (
        <TrashIcon
          className="w-6 h-6"
          onClick={() => handleDelete(maintenanceRequest.id ?? 0)}
        />
      )}
    </div>
  );
};

export default ActionButtons;
