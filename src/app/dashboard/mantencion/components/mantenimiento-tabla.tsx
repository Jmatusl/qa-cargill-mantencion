import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function MantenimientoTabla() {
  return (
    <div className="mt-4 md:mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de mantenimiento</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              className="max-w-xs"
              placeholder="Buscar solicitudes..."
              type="search"
            />
            <Button variant="outline">Exportar a Excel</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Buque</TableHead>
                <TableHead>Sistema</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Tipo de Requerimiento</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Días activos</TableHead>
                <TableHead>Fecha estimada de resolución</TableHead>
                <TableHead>Acciones tomadas</TableHead>
                <TableHead>Responsable de mantenimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2023-05-01</TableCell>
                <TableCell>Buque Aquamarine</TableCell>
                <TableCell>Propulsión</TableCell>
                <TableCell>Motor</TableCell>
                <TableCell>Sobrecalentamiento</TableCell>
                <TableCell>
                  El motor se sobrecalentó durante la operación
                </TableCell>
                <TableCell>5</TableCell>
                <TableCell>2023-05-06</TableCell>
                <TableCell>
                  Reemplazados componentes del sistema de refrigeración
                </TableCell>
                <TableCell>John Doe</TableCell>
                <TableCell>
                  <Badge color="green" variant="outline">
                    Cerrada
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost">
                    <FilePenIcon className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-04-15</TableCell>
                <TableCell>Buque Poseidon</TableCell>
                <TableCell>Eléctrico</TableCell>
                <TableCell>Generador</TableCell>
                <TableCell>Falla para arrancar</TableCell>
                <TableCell>
                  El generador no arrancó durante el mantenimiento de rutina
                </TableCell>
                <TableCell>3</TableCell>
                <TableCell>2023-04-18</TableCell>
                <TableCell>Reemplazado el arrancador del generador</TableCell>
                <TableCell>Jane Smith</TableCell>
                <TableCell>
                  <Badge color="green" variant="outline">
                    Cerrada
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost">
                    <FilePenIcon className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-06-01</TableCell>
                <TableCell>Buque Triton</TableCell>
                <TableCell>Hidráulico</TableCell>
                <TableCell>Grúa</TableCell>
                <TableCell>Fuga</TableCell>
                <TableCell>
                  Fuga de fluido hidráulico en el sistema de la grúa
                </TableCell>
                <TableCell>2</TableCell>
                <TableCell>2023-06-03</TableCell>
                <TableCell>
                  Reparados mangueras y accesorios hidráulicos
                </TableCell>
                <TableCell>Michael Johnson</TableCell>
                <TableCell>
                  <Badge color="yellow" variant="outline">
                    Pendiente
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost">
                    <FilePenIcon className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function FilePenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
