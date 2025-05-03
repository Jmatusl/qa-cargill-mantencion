import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Optional utility function for conditional classnames

interface EquipmentExtraProps {
  extra: string | null | undefined;
}

const EquipmentExtra: React.FC<EquipmentExtraProps> = ({ extra }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!extra) {
    return null; // No mostrar nada si `extra` está vacío o es nulo
  }

  return (
    <Card className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md shadow-sm">
      <CardHeader>
        <CardTitle className="text-red-800">Pasos previos de solución</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-800">
            <div>{extra}</div>
        </div>

      </CardContent>
    </Card>
  );
};

export default EquipmentExtra;
