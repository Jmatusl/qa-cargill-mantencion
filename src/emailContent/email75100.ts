export function maintenanceReportEmailHtml() {
    // Devolver HTML básico
    return `
      <!DOCTYPE html>
      <html lang="es">
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
                  background-color: #f9f9f9;
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
            .email-header img {
                max-width: 150px;
                margin-bottom: 10px;
            }
              .email-content {
                padding: 20px;
                line-height: 1.5;
                color: #333333;
            }
              .email-footer {
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
                color: #999999;
            }
          </style>
          <title>Notificación de Mantención</title>
      </head>
      <body>
          <div class="email-container">
              <div class="email-header">
              <img src="/sotex-logo-2.png" alt="Sotex Logo" />
              <h2>Alerta Plazo de Solución</h2>
          </div>
              <div class="email-content">
                  <p>Estimado/a usuario/a:</p>
                  <p>
                      Se informa que existen reportes de falla que han llegado a un periodo crítico, en relación con el plazo de solución definido.
                  </p>
                  <p>
                      Para mayor detalle, se adjunta listado de solicitudes o puede consultar directamente en el Módulo de Mantención.
                  </p>
                  <p>
                      Agradecemos tomar las medidas necesarias para mitigar los riesgos y restablecer el funcionamiento normal de la instalación.
                  </p>
              <p>Atte.,</p>
              <p><em>SISTEMA GEOP</em></p>
          </div>
      </body>
      </html>`;
  }
  