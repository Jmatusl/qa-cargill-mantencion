export function newUserEmailHtml(link: string, userEmail: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0px;
        }
        .email-content {
            line-height: 1.5;
            color: #333333;
        }
        .email-content h1, .email-content h2, .email-content h3, .email-content p {
            color: #333333;
        }
        .email-content a {
            color: #0066cc;
            text-decoration: underline;
        }
        .footer-text {
            font-size: 12px;
            color: #999999;
        }
        .email-header, .email-footer {
            text-align: center;
            margin-bottom: 20px;
        }
        .email-footer img {
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-content">
            <h1>BIENVENIDO A MANTENCIÓN SOTEX</h1>
            <p>Estimado Usuario,</p>
            <p>Nos complace darte la bienvenida al sistema Mantención Sotex. Tu cuenta de usuario ha sido creada con éxito y estás a solo unos pasos de acceder al sistema.</p>
            <p>Para garantizar la seguridad de tu información, te pedimos configurar tu contraseña personal. Puedes hacerlo siguiendo estos sencillos pasos:</p>
            <ol>
                <li>Visita el siguiente enlace: <a href="${link}">Configurar Contraseña</a></li>
                <li>Ingresa tu dirección de correo electrónico: ${userEmail}</li>
                <li>Sigue las instrucciones para establecer tu nueva contraseña.</li>
            </ol>
            <p>Por razones de seguridad, este enlace expirará en 24 horas. Si no logras configurar tu contraseña dentro de este periodo, por favor, solicita un nuevo enlace de configuración contactando a nuestro equipo de soporte técnico en <a href="mailto:analia.maturana@sotex.cl">analia.maturana@sotex.cl</a>.</p>
            <p>Una vez establecida tu contraseña, podrás acceder al sistema de Mantención en cualquier momento visitando: <a href="%%">Mantención</a></p>
            <p><strong>Soporte Técnico y Ayuda</strong><br>Si tienes alguna pregunta o necesitas asistencia durante el proceso de configuración de tu cuenta, no dudes en contactarnos a través de <a href="mailto:analia.maturana@sotex.cl">analia.maturana@sotex.cl</a> o llamando al +56 9 9227 9647.</p>
        </div>
        <div class="email-footer">
            <p class="footer-text">Cordialmente,</p>
            <p class="footer-text">Equipo Sotex</p>
        </div>
    </div>
</body>
</html>`;
}
