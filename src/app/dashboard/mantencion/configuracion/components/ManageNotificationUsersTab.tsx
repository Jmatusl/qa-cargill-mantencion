"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import {
  useGetNotificationGroups,
  usegetAllRolesWithNotificationSettings,
  // Comentamos la antigua importación
  // useUpdateNotificationSettings,
} from "@/hooks/useQueriesNotifications";
import { useUpdateNotificationSettings } from "@/hooks/useQueriesNotifications";
import { Separator } from "@radix-ui/react-dropdown-menu";

interface Notifications {
  [key: string]: boolean;
}

interface RoleNotifications {
  [key: number]: Notifications;
}

export default function ManageNotificationUsers() {
  // const { mutate: updateNotificationSettings, isPending } = useUpdateNotificationSettings();
  // En su lugar usamos la nueva mutación
  const { mutate: updateAllNotificationSettings, isPending } = useUpdateNotificationSettings();

  const {
    data: rolesData,
    isLoading: isRolesLoading,
    error: rolesError,
  } = usegetAllRolesWithNotificationSettings();

  const {
    data: notificationGroups,
    isLoading: isNotificationGroupsLoading,
    error: notificationGroupsError,
  } = useGetNotificationGroups();

  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [roleNotifications, setRoleNotifications] = useState<RoleNotifications>({});
  const [initialRoleNotifications, setInitialRoleNotifications] = useState<RoleNotifications>({});
  const [pendingChanges, setPendingChanges] = useState<{
    roleId: number;
    notificationGroupId: number;
    enabled: boolean;
  }[]>([]);

  useEffect(() => {
    if (rolesData) {
      const initialRoleNotifications: RoleNotifications = {};
      rolesData.forEach((role: any) => {
        initialRoleNotifications[role.id] = {};
        role.NotificationGroupRole.forEach((ngRole: any) => {
          initialRoleNotifications[role.id][ngRole.notificationGroup.name] = true;
        });
      });

      // Estado principal (lo que el usuario puede ir cambiando)
      setRoleNotifications(initialRoleNotifications);

      // Estado inicial (para poder revertir)
      setInitialRoleNotifications(initialRoleNotifications);
    }
  }, [rolesData]);

  const handleRevertChanges = () => {
    // Restaura 'roleNotifications' a su estado inicial
    setRoleNotifications(initialRoleNotifications);
    // Limpia los cambios pendientes
    setPendingChanges([]);
  };


  const handleRoleChange = (roleId: number) => {
    console.log("rolesdata:", rolesData);
    setSelectedRole(roleId);
  };

  const handleNotificationToggle = (groupName: string, groupId: number) => {
    if (selectedRole !== null) {
      const currentState = roleNotifications[selectedRole]?.[groupName] || false;

      // Actualizar el estado local
      setRoleNotifications((prev) => ({
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [groupName]: !currentState,
        },
      }));

      // Registrar el cambio pendiente
      setPendingChanges((prev) => [
        ...prev,
        {
          roleId: selectedRole,
          notificationGroupId: groupId,
          enabled: !currentState,
        },
      ]);
    }
  };

  const handleSaveChanges = () => {
    // En lugar de iterar en front y hacer llamadas a cada cambio,
    // mandamos TODO el array al backend en UNA llamada
    updateAllNotificationSettings({ changes: pendingChanges });

    // Limpiar cambios pendientes tras disparar la mutación
    setPendingChanges([]);
  };

  if (isRolesLoading || isNotificationGroupsLoading) return <div>Loading...</div>;
  if (rolesError || notificationGroupsError) return <div>Error loading data</div>;

  return (
    <div className="grid gap-4 max-w-md mx-auto md:max-w-3xl">
      <Card className="p-2 ">
        <CardHeader>
          <CardTitle className="text-base ">
            Gestionar Notificaciones por Rol
          </CardTitle>
          <CardDescription className="text-sm ">
            Seleccione un rol y administre sus notificaciones. Visualice los
            usuarios que reciben estas notificaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:gap-4">
          <div className="grid gap-1 md:gap-2">
            <Label htmlFor="roles" className="text-sm ">
              Roles
            </Label>
            <Select
              disabled={isPending}
              onValueChange={(value) => handleRoleChange(Number(value))}
            >
              <SelectTrigger className="w-full text-sm ">
                <SelectValue placeholder="Seleccione un rol" />
              </SelectTrigger>
              <SelectContent>
                {rolesData?.map((role: any) => (
                  <SelectItem
                    key={role.id}
                    value={role.id.toString()}
                    className="text-sm "
                  >
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {notificationGroups && selectedRole !== null && (
            <>
              <h3 className="mt-2 text-base md:mt-4 font-medium">
                Notificaciones
              </h3>
              {notificationGroups.map((group: any) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between text-sm "
                >
                  <div className="space-y-1">
                    <p className="font-medium">{group.name}</p>
                  </div>
                  <Switch
                    disabled={isPending}
                    id={group.id.toString()}
                    checked={roleNotifications[selectedRole]?.[group.name] || false}
                    onCheckedChange={() =>
                      handleNotificationToggle(group.name, group.id)
                    }
                    className="ml-auto size-6"
                  />
                </div>
              ))}
              <Separator className=" border-b-2" />
              <h3 className="mt-2 text-base md:mt-4 font-medium">
                Usuarios en el Rol
              </h3>
              {rolesData &&
                rolesData
                  .find((role: any) => role.id === selectedRole)
                  ?.users.filter(
                    (user: any, index: number, self: any[]) =>
                      // Filtrar duplicados por ID de usuario
                      self.findIndex((u: any) => u.user.id === user.user.id) === index
                  )
                  .map((userRole: any) => (
                    <div
                      key={userRole.user.id}
                      className="flex items-center justify-between text-xs "
                    >
                      <p>{userRole.user.username}</p>
                      <p>{userRole.user.email}</p>
                    </div>
                  ))}
            </>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        {pendingChanges.length > 0 && (
          <Button
            variant="outline"
            className="text-sm"
            onClick={handleRevertChanges}
            disabled={isPending || !pendingChanges.length}
          >
            Revertir Cambios
          </Button>

        )}
        <Button
          onClick={handleSaveChanges}
          className="text-sm"
          disabled={!pendingChanges.length || isPending}
        >
          Guardar Cambios
        </Button>
      </div>

    </div>
  );
}
