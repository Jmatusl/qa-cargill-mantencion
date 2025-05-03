import fs from "fs";
import path from "path";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  user,
  emailHtml,
  content,
  attachmentPath, // Ruta del archivo adjunto
}: {
  user: { email: string };
  emailHtml: string;
  content: string;
  attachmentPath?: string; // Opcional, por si no siempre hay un adjunto
}) {
  try {
    console.log("Enviando correo a:", user.email);

    let attachments = [];
    if (attachmentPath) {
      // Leer el archivo y codificarlo en base64
      const fileContent = fs.readFileSync(attachmentPath).toString("base64");
      const fileName = path.basename(attachmentPath);
      attachments.push({
        filename: fileName,
        content: fileContent,
        encoding: "base64",
      });
    }

    const tx = await resend.emails.send({
      from: `"GEOP APP" <${process.env.EMAIL_FROM}>`,
      to: [user.email, "reportes@sotex.app"],
      subject: content,
      html: emailHtml,
      attachments, // Adjuntar archivos
    });

    console.log("Correo enviado:", tx);
    return tx;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return new Error("Error al enviar correo");
  }
}
