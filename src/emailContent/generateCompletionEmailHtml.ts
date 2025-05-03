export function generateCompletionEmailHtml(
    maintenance: any, responsibleName: string
) {
    const {
        id,
        description = "No especificada",
        equipment,
        ship,
        folio,
        createdAt,
    } = maintenance;

    const equipmentInfo = equipment
        ? `${equipment.name}`
        : "No especificado";

    const shipInfo = ship
        ? `${ship.name}`
        : "No especificada";

    // Formatear las fechas
    const createdDate = new Date(createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const today = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Calcular el plazo en días
    const plazo = Math.floor(
        (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    return `<!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
        <style>
            @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 400;
                src: url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19) format('woff2');
            }
            body, html {
                font-family: 'Inter', sans-serif;
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
            .email-header img {
                max-width: 150px;
                margin-bottom: 10px;
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
                <h2>Solicitud de Mantención Completada</h2>
            </div>
            <div class="email-content">
                <p>Estimado/a usuario/a:</p>
                <p>La solicitud de mantención con folio <strong>${folio}</strong>, generada con fecha <strong>${createdDate}</strong>, ha sido completada con fecha <strong>${today}</strong> (${plazo} días falla activa).</p>
                <p>Los detalles de este requerimiento son:</p>
                <ul>
                    <li><strong>Responsable:</strong> ${responsibleName}</li>
                    <li><strong>Equipo:</strong> ${equipmentInfo}</li>
                    <li><strong>Instalación:</strong> ${shipInfo}</li>
                    <li><strong>Descripción:</strong> ${description}</li>
                </ul>
                <div class="email-link-container">
                  <a href="${baseUrl}/dashboard/mantencion/solicitudes/${id}">
                      Ir a la solicitud
                  </a>
              </div>
                <p>Gracias por supervisar este proceso.</p>
                <p>Atte.,</p
                <p><em>SISTEMA GEOP</em></p>
          </div>
          </div>
    </body>
    </html>`;
}
