"use client";

import React, { useState } from "react";
import {
  useRequestTypesQuery,
  useCreateRequestTypeMutation,
  useUpdateRequestTypeMutation,
  useDeleteRequestTypeMutation,
} from "@/hooks/useRequestType";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FormState {
  id?: number;
  name: string;
  description?: string;
}

const RequestTypesPage = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", description: "" });

  const { data: requestTypes, isLoading } = useRequestTypesQuery();
  const createMutation = useCreateRequestTypeMutation();
  const updateMutation = useUpdateRequestTypeMutation();
  const deleteMutation = useDeleteRequestTypeMutation();

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (form.id) {
      updateMutation.mutate(
        { id: form.id, data: { name: form.name, description: form.description } },
        {
          onSuccess: () => {
            toast.success("Tipo actualizado");
            setOpen(false);
            setForm({ name: "", description: "" });
          },
          onError: () => toast.error("Error actualizando tipo"),
        }
      );
    } else {
      createMutation.mutate(
        { name: form.name, description: form.description },
        {
          onSuccess: () => {
            toast.success("Tipo creado");
            setOpen(false);
            setForm({ name: "", description: "" });
          },
          onError: () => toast.error("Error creando tipo"),
        }
      );
    }
  };

  const handleEdit = (type: {
    id: number;
    name: string;
    description: string | null;
  }) => {
    setForm({
      id: type.id,
      name: type.name,
      description: type.description ?? "",
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este tipo de requerimiento?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Tipo eliminado"),
        onError: () => toast.error("Error al eliminar"),
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-2xl font-bold text-[#284893]">
            Tipos de Requerimiento
          </CardTitle>
          <Button onClick={() => setOpen(true)}>Nuevo Tipo</Button>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-gray-600">Cargando tipos...</p>
          ) : requestTypes?.length === 0 ? (
            <p className="text-sm text-gray-600">No hay tipos registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(requestTypes ?? []).map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>{type.name}</TableCell>
                    <TableCell>{type.description || "Sin descripción"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleEdit(type)}>
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(type.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>


      </Card>

      {/* Modal de crear/editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Tipo" : "Nuevo Tipo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Descripción</label>
              <Input
                value={form.description || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
            >
              {form.id ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestTypesPage;
