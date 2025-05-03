"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ManageNotificationUsers from "./components/ManageNotificationUsersTab";
import useUserRoles from "@/hooks/useUserRoles";
import NoPermission from "@/components/NoPermission";
import ResponsibleAsignations from "./components/ResponsibleAsignations";

function Page() {
  const { isAllowed } = useUserRoles([3, 5, 6, 7, 8]);
  if (!isAllowed) {
    return <NoPermission />;
  }
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <Card className="w-full items-center bg-white dark:bg-gray-800 rounded-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Configuración Mantención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              onValueChange={(value) => console.log(value)}
              defaultValue="Responsables Mantención"
            >
              <TabsList className="flex flex-wrap gap-2  ">
                <TabsTrigger value="Responsables Mantención" className="flex-1">
                  Responsables Mantención
                </TabsTrigger>
                <TabsTrigger
                  value="Grupos de Notificaciones"
                  className="flex-1"
                >
                  Grupos de Notificaciones
                </TabsTrigger>
              </TabsList>
              <TabsContent value="Responsables Mantención">
                <div>
                  <ResponsibleAsignations />
                </div>
              </TabsContent>

              <TabsContent value="Grupos de Notificaciones">
                <div>
                  <ManageNotificationUsers />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Page;
