import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/Modal';
import NewUser from '@/components/NewUserContentModal';
import { AlignJustifyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, Role } from '@prisma/client';
import RoleFilter from './RoleFilter';

interface UserRole {
  role: Role;
}

export type UserType = User & {
  roles: UserRole[];
};

const roleFilterFn: FilterFn<UserType> = (row, columnId, filterValue) => {
  const rowRoles = row.getValue(columnId) as UserRole[];
  const filterValues = filterValue as string[];
  return (
    filterValues.length === 0 ||
    rowRoles.some((role) => filterValues.includes(role.role.name))
  );
};

export const userColumns: ColumnDef<UserType>[] = [
  {
    accessorKey: 'edit',
    header: 'Editar',
    cell: ({ row }) => (
      <Modal
        trigger={
          <button className="bg-transparent" disabled={!row.original.username}>
            <AlignJustifyIcon
              className={`h-5 w-5 mx-3 ${!row.original.username && 'opacity-0'}`}
            />
          </button>
        }
        data={row.original}
      >
        <NewUser />
      </Modal>
    ),
    enableSorting: false, 
  },
  {
    accessorKey: 'username',
    header: 'Nombre Usuario',
    cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
    enableSorting: true, 
  },
  {
    accessorKey: 'email',
    header: 'Correo Electrónico',
    cell: ({ row }) => row.original.email,
    enableSorting: true, 
  },
  {
    accessorKey: "roles",
    header: "Rol",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-2">
        {row.original.roles.map((role) => (
          <Badge
            key={role.role.name}
            variant="outline"
            className="text-xs text-center bg-slate-300 border border-slate-500 shadow-lg"
          >
            {role.role.name}
          </Badge>
        ))}
      </div>
    ),
    filterFn: roleFilterFn, 
    enableSorting: false, 
  },
  {
    accessorKey: 'verified',
    header: 'Estado',
    cell: ({ row }) => (row.original.verified ? 'Verificado' : 'No verificado'),
    enableSorting: true,
  },
];
