"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useEnableEmailNotification, useGetNotificationGroupsByRole, useUserRoles } from "@/hooks/useQueriesNotifications";
import { NotificationGroup } from "@prisma/client";

interface UserRole {
  userId: number;
  roleId: number;
  notificationGroupId: number;
  emailNotifications: boolean;
}

interface NotificationGroupWithDetails extends NotificationGroup {
  details: string | null;
}

export default function NotificationSettings() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const {
    data: userRoles,
    isLoading: rolesLoading,
    isError: rolesError,
    error: rolesErrorData,
  } = useUserRoles(userId || -1);

  const enableEmailNotificationMutation = useEnableEmailNotification();

  const [notificationGroups, setNotificationGroups] = useState<NotificationGroupWithDetails[]>([]);
  const [emailNotificationStates, setEmailNotificationStates] = useState<{ [groupId: number]: boolean }>({});
  const [initialNotificationStates, setInitialNotificationStates] = useState<{ [groupId: number]: boolean }>({});
  const [pendingChanges, setPendingChanges] = useState<{ groupId: number; enabled: boolean }[]>([]);

  const roleIds = userRoles?.map((userRole: UserRole) => userRole.roleId) ?? [];
  const {
    data: notificationGroupsByRole,
    isLoading: groupsLoading,
    isError: groupsError,
  } = useGetNotificationGroupsByRole(roleIds);

  useEffect(() => {
    if (userRoles && notificationGroupsByRole) {
      const combinedGroups = notificationGroupsByRole.flat() as NotificationGroupWithDetails[];
      const uniqueGroups = Array.from(
        new Map(combinedGroups.map((group) => [group.id, group])).values()
      );

      setNotificationGroups(uniqueGroups);

      const initialStates = uniqueGroups.reduce((acc, group) => {
        const relatedRoles = userRoles.filter(
          (userRole) => userRole.notificationGroupId === group.id
        );
        acc[group.id] = relatedRoles.some((userRole) => userRole.emailNotifications);
        return acc;
      }, {} as { [groupId: number]: boolean });

      setEmailNotificationStates(initialStates);
      setInitialNotificationStates(initialStates);
    }
  }, [userRoles, notificationGroupsByRole]);

  const handleToggleEmailNotification = (groupId: number, enabled: boolean) => {
    setEmailNotificationStates((prevState) => ({
      ...prevState,
      [groupId]: enabled,
    }));

    // Registrar solo los cambios con respecto al estado inicial
    setPendingChanges((prevChanges) => {
      const exists = prevChanges.find((change) => change.groupId === groupId);
      const isReverting = initialNotificationStates[groupId] === enabled;

      if (isReverting) {
        // Si está revirtiendo el cambio, lo eliminamos de los pendientes
        return prevChanges.filter((change) => change.groupId !== groupId);
      }

      if (exists) {
        // Si ya existe, actualizamos su estado
        return prevChanges.map((change) =>
          change.groupId === groupId ? { ...change, enabled } : change
        );
      }

      // Si es un nuevo cambio, lo agregamos
      return [...prevChanges, { groupId, enabled }];
    });
  };

  const handleSaveChanges = () => {
    enableEmailNotificationMutation.mutate({
      userId,
      changes: pendingChanges.map(({ groupId, enabled }) => ({
        groupId,
        emailNotifications: enabled,
      })),
    });

    // Limpias tu estado local tras la mutación
    setInitialNotificationStates(emailNotificationStates);
    setPendingChanges([]);
  };

  const handleCancelChanges = () => {
    setEmailNotificationStates(initialNotificationStates);
    setPendingChanges([]);
  };

  if (!userId) return <p>Por favor inicia sesión.</p>;
  if (rolesLoading || groupsLoading) return <p>Cargando configuración de notificaciones...</p>;
  if (rolesError) return <p>Error en roles: {rolesErrorData instanceof Error ? rolesErrorData.message : "Algo salió mal."}</p>;
  if (groupsError) return <p>Error cargando los grupos de notificación.</p>;

  return (
    <div className="grid gap-10 mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Seleccione lo que desea ser notificado.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {notificationGroups.length > 0 ? (
            notificationGroups.map((group) => (
              <div key={group.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{group.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {group.details || "Descripción no disponible."}
                  </p>
                </div>
                <Switch
                  id={`notification-group-${group.id}`}
                  checked={emailNotificationStates[group.id]}
                  onCheckedChange={(checked) =>
                    handleToggleEmailNotification(group.id, checked)
                  }
                  disabled={enableEmailNotificationMutation.isPending}
                  className="ml-auto"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay grupos de notificación disponibles para sus roles.
            </p>
          )}
          <div className="flex justify-end gap-2">
            {pendingChanges.length > 0 && (
              <Button
                variant="outline"
                disabled={enableEmailNotificationMutation.isPending}
                onClick={handleCancelChanges}
              >
                Revertir Cambios
              </Button>
            )}
            <Button
              disabled={enableEmailNotificationMutation.isPending || !pendingChanges.length}
              onClick={handleSaveChanges}
            >
              Guardar Cambios
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
