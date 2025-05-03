// hooks/useUserRoles.ts
import { useMemo } from "react";
import { useSession } from "next-auth/react";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface UserRole {
  userId: number;
  roleId: number;
  role: Role;
}

const useUserRoles = (allowedRoleIds: number[] = []) => {
  const { data: session, status } = useSession();

  const userRoles: UserRole[] = useMemo(() => {
    if (status === "authenticated" && session?.user) {
      return (session.user as any).roles || [];
    }
    return [];
  }, [session, status]);

  const isAllowed = useMemo(() => {
    return userRoles.some((userRole) => allowedRoleIds.includes(userRole.role.id));
  }, [userRoles, allowedRoleIds]);

  return { userRoles, isAllowed };
};

export default useUserRoles;
