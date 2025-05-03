// components/InfoItem.tsx
import React from "react";

interface InfoItemProps {
  label: string;
  value: string | number | undefined;
  icon: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => (
  <div className="bg-gray-50 p-3 rounded-lg w-full">
    <p className="text-xs md:text-sm text-gray-500 mb-2">{label}</p>
    <div className="flex items-center space-x-2">
      <div className="flex-shrink-0">{icon}</div>
      <p className="font-semibold text-sm md:text-base">{value}</p>
    </div>
  </div>
);

export default InfoItem;
