export function generateEmailHtmlForAreaHead(maintenance: any): string {
    const {
        id,
        description = "No especificada",
        equipment,
        ship,
        folio,
        responsible,
    } = maintenance;

    const equipmentInfo = equipment
        ? `${equipment.name}`
        : "No especificado";

    const shipInfo = ship
        ? `${ship.name}`
        : "No especificada";

    const responsibleInfo = responsible
        ? `${responsible.name}`
        : "No especificado";

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    return `<!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
        <style>
            body, html {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f9;
                font-size: 16px;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border: 1px solid #dddddd;
                border-radius: 5px;
            }
            .email-header {
                text-align: center;
                background-color: #263674;
                color: #ffffff;
                padding: 15px;
                border-radius: 5px 5px 0 0;
            }
            .email-header h2 {
                margin: 0;
                font-size: 1.8em;
            }
            .email-header img {
                max-width: 150px;
                margin-bottom: 10px;
            }
            .email-content {
                padding: 20px;
                line-height: 1.5;
                color: #333333;
            }
            .email-content p {
                margin: 10px 0;
            }
            .email-content strong {
                color: #263674;
            }
            .email-footer {
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
                color: #999999;
            }
            .email-link-container {
                text-align: center; 
                margin: 20px 0; 
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="/sotex-logo-2.png" alt="Sotex Logo" />
                <h2>Solicitud de Mantención Recibida</h2>
            </div>
            <div class="email-content">
                <p>Estimado/a usuario:</p>
                <p>Se le notifica que se ha generado un nuevo requerimiento a nombre del usuario mantención <strong>${responsibleInfo}</strong>.</p>
                <p>Detalles de la solicitud:</p>
                <p><strong>Folio:</strong> ${folio}</p>
                <p><strong>Equipo:</strong> ${equipmentInfo}</p>
                <p><strong>Instalación:</strong> ${shipInfo}</p>
                <p><strong>Descripción:</strong> ${description}</p>
                <p>Para revisar esta solicitud, puede ingresar a: </p>
                <div class="email-link-container">
                    <a href="${baseUrl}/dashboard/mantencion/solicitudes/${id}">
                        Ir a la solicitud
                    </a>
                </div>
                <p>Gracias,</p>
                <p><em>SISTEMA GEOP</em></p>
            </div>
        </div>
    </body>
    </html>`;
}
