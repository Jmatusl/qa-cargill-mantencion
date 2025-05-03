import ExcelJS from "exceljs";

type FormatColumns = {
    id: number;
    folio: string | null;
    equipment: string | null;
    subarea: string;
    ship: string | null;
    faultType: string;
    description: string;
    status: string;
    responsible: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type FormatEquiposColumns = {
    id: number;
    name: string;
    area: string;
    subarea: string;
    responsibleName: string | null;
    responsibleEmail: string | null;
    shipName: string;
    createdAt: Date;
    updatedAt: Date;
};


export const exportToExcel = async (selectedRows: any[], templateUrl: string, fileName: string) => {
    if (selectedRows.length === 0) {
        alert("No hay filas seleccionadas para exportar.");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const response = await fetch(templateUrl);
    const data = await response.arrayBuffer();
    await workbook.xlsx.load(data);
    const worksheet = workbook.worksheets[0];

    let filteredColumns: FormatColumns[] | FormatEquiposColumns[] = [];

    if (templateUrl.includes("/format.xlsx")) {
        filteredColumns = selectedRows.map((row) => ({
            id: row.id,
            folio: row.folio,
            equipment: row.equipment?.name,
            subarea: row.equipment?.subarea,
            ship: row.ship?.name,
            faultType: row.faultType,
            description: row.description,
            status: row.status,
            responsible: row.responsible?.name,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));
    } else if (templateUrl.includes("/format_equipos.xlsx")) {
        filteredColumns = selectedRows.map((row) => ({
            id: row.id,
            name: row.name,
            area: row.area,
            subarea: row.subarea,
            responsibleName: row.responsibleName,
            responsibleEmail: row.responsibleEmail,
            shipName: row.shipName,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));
    }

    const startRow = 8;
    const startColumn = 2;

    filteredColumns.forEach((row, rowIndex) => {
        Object.values(row).forEach((value, colIndex) => {
            const cell = worksheet.getCell(startRow + rowIndex, startColumn + colIndex);
            cell.value = value;

            // Alinear texto a la izquierda
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle', // Opcional, si quieres que el texto también esté centrado verticalmente
                wrapText: true, // Opcional, si quieres que el texto largo se ajuste dentro de la celda
            };

            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };

            cell.font = {
                name: 'Roboto',
                size: 10,
                color: { argb: 'FF000000' },
            };
        });
    });


    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
