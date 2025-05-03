"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGetOpenedAndInProgressMaintenanceRequests } from "@/hooks/UseQueriesMaintenance";
import { Responsible } from "@prisma/client";
import { DataTable } from "./data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MaintenanceRequestSchema } from "../data/schema";
import { columns } from "./columns";
import { z } from "zod";
import NoPermission from "@/components/NoPermission";
import useUserRoles from "@/hooks/useUserRoles";
import { SkeletonTable } from "../../components/SkeletonTable";
import { TailSpin } from "react-loader-spinner";

// Definimos las interfaces
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

interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  responsible?: Responsible;
}

export default function TablaSolicitudes() {
  const [responsibleId, setResponsibleId] = useState<number | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const userData = session?.user as User;
  console.log("userData", userData);
  const {
    data: maintenanceRequests = [],
    isSuccess,
    isFetching,
    isLoading,
    isError,
  } = useGetOpenedAndInProgressMaintenanceRequests(userData?.id || null);

  const { isAllowed } = useUserRoles([3, 5, 6, 7, 8]);
  if (!isAllowed) {
    return <NoPermission />;
  }

  const primaryRequests = maintenanceRequests.filter(
    (request:any) => request.faultType !== "Mantención Programada"
  );
  const secondaryRequests = maintenanceRequests.filter(
    (request:any) => request.faultType === "Mantención Programada"
  );

  return (
    <Card className="max-w-8xl mx-auto p-4">
      <CardHeader>
        <CardTitle>Listado de requerimientos</CardTitle>
        {isFetching && (
          <TailSpin
            visible={isFetching}
            height="26"
            width="26"
            color="#0000FF"
            ariaLabel="tail-spin-loading"
            wrapperStyle={{ marginLeft: "8px" }}
          />
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="primario" className="space-y-4">
          <TabsList>
            <TabsTrigger value="primario">Requerimientos Generales</TabsTrigger>
            <TabsTrigger value="secundario">Mantenciones Programadas</TabsTrigger>
          </TabsList>

          <TabsContent value="primario">
            {isLoading ? (
              <SkeletonTable />
            ) : isError ? (
              <div className="p-4 text-red-500">Error al cargar las solicitudes</div>
            ) : (
              isSuccess && (
                <DataTable columns={columns} data={primaryRequests} />
              )
            )}
          </TabsContent>

          <TabsContent value="secundario">
            {isLoading ? (
              <SkeletonTable />
            ) : isError ? (
              <div className="p-4 text-red-500">Error al cargar las solicitudes</div>
            ) : (
              isSuccess && (
                <DataTable columns={columns} data={secondaryRequests} />
              )
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}