// components/DateItem.tsx
import { CalendarIcon } from "lucide-react";

interface DateItemProps {
  label: string;
  value: string;
  className?: string;
}

const DateItem: React.FC<DateItemProps> = ({ label, value, className }) => (
  <div className="flex flex-col space-y-1 w-full">
    <label className="text-xs md:text-sm font-medium text-gray-500">
      {label}
    </label>
    <div className={`flex items-center space-x-2 p-3 rounded-lg ${className}`}>
      <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
      <span className="font-semibold text-sm md:text-base">{value}</span>
    </div>
  </div>
);

export default DateItem;
