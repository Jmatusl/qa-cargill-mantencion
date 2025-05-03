import ExcelJS from "exceljs";
import path from "path";

export async function createMaintenanceExcel(maintenanceRequests: any[]) {
  const workbook = new ExcelJS.Workbook();

  // Función para crear una hoja y llenarla
  const createSheet = (title: string, data: any[]) => {
    const sheet = workbook.addWorksheet(title);

    // Definir las columnas del Excel
    sheet.columns = [
      { header: "Folio", key: "folio", width: 20 },
      { header: "Nombre del Equipo", key: "equipment", width: 25 },
      { header: "Sistema", key: "subarea", width: 15 },
      { header: "Tipo de Falla", key: "faultType", width: 15 },
      { header: "Fecha de Ingreso", key: "createdAt", width: 25 },
      { header: "Instalación", key: "ship", width: 20 },
      { header: "Responsable", key: "responsible", width: 25 },
      { header: "Estado", key: "status", width: 15 },
      { header: "Días Falla", key: "failureDays", width: 15 },
      { header: "Fecha Estimada", key: "estimatedSolution", width: 25 },
      { header: "Enlace", key: "link", width: 40 },
    ];

    // Llenar las filas de la hoja
    data.forEach((item) => {
      const today = new Date();
      const createdDate = new Date(item.createdAt);
      const failureDays =
        createdDate instanceof Date && !isNaN(createdDate.getTime())
          ? Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
          : "N/A";
      const createdAt = createdDate instanceof Date && !isNaN(createdDate.getTime())
        ? createdDate.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        : "No Definido";

      const estimatedSolution = item.estimatedSolutions?.[0]?.date
        ? new Date(item.estimatedSolutions[0].date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        : "No definida";

      const shipName = item.ship?.name || "N/A";
      const responsibleName = item.responsible?.name || "No Asignado";
      const equipmentName = item.equipment?.name || "No Especificado";
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const link = {
        text: "Ver Solicitud",
        hyperlink: `${baseUrl}/dashboard/mantencion/solicitudes/${item.id}`,
      };

      sheet.addRow({
        folio: item.folio,
        status: item.status,
        faultType: item.faultType,
        failureDays,
        createdAt,
        estimatedSolution,
        ship: shipName,
        subarea: item.equipment?.subarea || "No Definido",
        responsible: responsibleName,
        equipment: equipmentName,
        link,
      });
    });

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center" };
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center" };
        if (rowNumber === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "263674" },
          };
          cell.font = { color: { argb: "FFFFFF" }, bold: true };
        }
      });
    });

    sheet.columns.forEach((column) => {
      if (column) {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, cellValue.length);
        });
        column.width = maxLength + 2;
      }
    });

    return sheet;
  };

  const fullCompleted = maintenanceRequests.filter(
    (req: any) => req.progressPercentage >= 100
  );
  const partialCompleted = maintenanceRequests.filter(
    (req: any) => req.progressPercentage >= 75 && req.progressPercentage < 100
  );
  if (partialCompleted.length > 0) {
    createSheet("75% Plazo cumplido", partialCompleted);
  }
  if (fullCompleted.length > 0) {
    createSheet("Plazo finalizado", fullCompleted);
  }

  // Cambiar la ruta al directorio temporal
  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "_"); // Reemplaza "/" por "_"

  const fileName = `“Fallas_alerta_plazo_solución_${formattedDate}.xlsx`;
  const filePath = path.join("/tmp", fileName);

  await workbook.xlsx.writeFile(filePath);

  return filePath;

}
