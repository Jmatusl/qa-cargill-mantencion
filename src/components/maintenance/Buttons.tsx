import React from 'react';
import { RefreshCwIcon, FileXIcon, Paintbrush } from 'lucide-react';
import { Button } from '../../components/ui/button'; // Asegúrate de importar el componente Button desde la ubicación correcta

interface MaintenanceButtonsProps {
  isAdmin: boolean;
}

const MaintenanceButtons: React.FC<MaintenanceButtonsProps> = ({ isAdmin }) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-2">  {/* Added flex-wrap and gap-2 */}
      <Button className="flex items-center w-full sm:w-auto px-2 py-1" size="sm">
        <Paintbrush className="w-6 h-6 mr-2" />
        Limpiar
      </Button>
      <Button className="flex items-center w-full sm:w-auto px-2 py-1" size="sm">
        <RefreshCwIcon className="w-6 h-6 mr-2" />
        Generar
      </Button>
      {isAdmin && (
        <Button className="flex items-center w-full sm:w-auto px-2 py-1" size="sm">
          <FileXIcon className="w-6 h-6 mr-2" />
          Descargar
        </Button>
      )}
    </div>
  );
};

export default MaintenanceButtons;
