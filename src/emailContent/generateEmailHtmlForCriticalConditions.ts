export function generateEmailHtmlForCriticalConditions(
    shipName: string,
    criticalConditions: string[]
  ): string {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return `<!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
          <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
          <style>
              body, html {
                  font-family: 'Roboto', Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f9;
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
              .email-content .ship-name {
                  color: rgb(255, 8, 0);
                  font-weight: bold;
              }
              .email-content .highlight {
                  font-weight: bold;
              }
              .email-footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #999999;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-header">
                  <img src="/sotex-logo-2.png" alt="Sotex Logo" />
                  <h2>Alerta Condiciones Críticas</h2>
              </div>
              <div class="email-content">
                  <p>Estimado/a usuario/a:</p>
                  <p>Se han detectado las siguientes condiciones críticas en la instalación <span class="ship-name">${shipName}</span>.</p>
                  <ul>
                      ${criticalConditions.map((reason) => {
                        // Aplicar clase `highlight` para la negrita en las fallas
                        return `<li>${reason.replace(/Fallas ordinarias|Fallas operativas|Fallas de equipo/gi, (match) => `<span class="highlight">${match}</span>`)}</li>`;
                      }).join("")}
                  </ul>
                  <p>Para mayor detalle, se adjunta listado de solicitudes o puede consultar directamente en el Módulo de Mantención.</p>
                  <p>Agradecemos tomar las medidas necesarias para mitigar los riesgos y restablecer el funcionamiento normal de la instalación.</p>
                  <p>Atte.,</p>
                  <p><em>SISTEMA GEOP</em></p>
              </div>
          </div>
      </body>
      </html>`;
  }
