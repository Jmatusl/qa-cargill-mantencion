import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

// Nota: Ajusta las columnas y nombres según tu modelo.
export async function createCriticalConditionsExcel(
  ordinaryData: any[],
  equipmentData: any[],
  operationalData: any[],
  shipName: string
): Promise<string> {
  const workbook = new ExcelJS.Workbook();

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Función interna para añadir hoja + filas
  function addSheet(sheetName: string, data: any[]) {
    if (data.length === 0) {
      return; // No crear la hoja si no hay datos
    }
    const sheet = workbook.addWorksheet(sheetName);

    // Define las columnas (ajusta a tus campos reales)
    sheet.columns = [
      { header: "Folio", key: "folio", width: 20 },
      { header: "Nombre del Equipo", key: "equipmentName", width: 25 },
      { header: "Sistema", key: "subarea", width: 15 },
      { header: "Tipo Falla", key: "faultType", width: 15 },
      { header: "Fecha de Ingreso", key: "createdAt", width: 20 },
      { header: "Responsable", key: "responsibleName", width: 25 },
      { header: "Estado", key: "status", width: 15 },
      { header: "Días Falla", key: "diasFalla", width: 15 },
      { header: "Fecha Estimada", key: "estimatedSolution", width: 25 },
      { header: "Enlace", key: "link", width: 50 },
    ];

    data.forEach((item) => {
      const linkValue = {
        text: "Ver Solicitud",
        hyperlink: `${baseUrl}/dashboard/mantencion/solicitudes/${item.id}`,
      };

      // Calcular días de falla
      const createdAt = new Date(item.createdAt);
      const today = new Date();
      const diasFalla = Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // Obtener fecha estimada de solución (posición 0)
      const estimatedSolution = item.estimatedSolutions?.[0]?.date
        ? new Date(item.estimatedSolutions[0].date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        : "No definida";

      sheet.addRow({
        id: item.id,
        folio: item.folio,
        status: item.status,
        faultType: item.faultType,
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          : "",
        diasFalla,
        estimatedSolution,
        equipmentName: item.equipment?.name || "No Especificado",
        subarea: item.equipment?.subarea || "No Definido",
        responsibleName: item.responsible?.name || "No Asignado",
        link: linkValue,
      });
    });

    // Estilos básicos
    sheet.getRow(1).font = { bold: true };
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
          cell.alignment = { horizontal: "center" };
        }
      });
    });
  }

  // Agrega las hojas según correspondan
  if (ordinaryData.length > 0) {
    addSheet("Fallas Ordinarias", ordinaryData);
  }
  if (equipmentData.length > 0) {
    addSheet("Fallas de Equipo", equipmentData);
  }
  if (operationalData.length > 0) {
    addSheet("Fallas Operativas", operationalData);
  }

  // Nombre del archivo
  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "_"); // Reemplaza "/" por "_"

  const fileName = `Fallas_condiciones_críticas_${shipName}_${formattedDate}.xlsx`;

  const filePath = path.join("/tmp", fileName);

  // Guardar el archivo
  await workbook.xlsx.writeFile(filePath);

  console.log("Archivo Excel creado:", filePath);
  return filePath;

}
