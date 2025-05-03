import React from "react";

interface RoleFilterProps {
  roles: string[];
  selectedRoles: string[];
  onChange: (selectedRoles: string[]) => void;
}

const RoleFilter: React.FC<RoleFilterProps> = ({
  roles,
  selectedRoles,
  onChange,
}) => {
  const handleCheckboxChange = (roleName: string) => {
    if (selectedRoles.includes(roleName)) {
      onChange(selectedRoles.filter((r) => r !== roleName));
    } else {
      onChange([...selectedRoles, roleName]);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-sg shadow-md">
      <p className="text-lg font-semibold mb-2 text-gray-700">Filtrar por Roles:</p>
      <div className="flex flex-wrap gap-3">
        {roles.map((roleName) => (
          <label
            key={roleName}
            className={`flex items-center space-x-1 py-2 px-2 rounded-full cursor-pointer transition 
                        ${
                          selectedRoles.includes(roleName)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                        }`}
          >
            <input
              type="checkbox"
              checked={selectedRoles.includes(roleName)}
              onChange={() => handleCheckboxChange(roleName)}
              className="hidden"
            />
            <span className="text-sm font-medium">{roleName}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RoleFilter;
