import crypto from "crypto";
import db from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/apiServices/emailServices";
import { resetPasswordEmailHtml } from "@/emailContent/reset-password";
import { User, Role } from "@prisma/client";

interface UserType extends User {
  role: Role;
}

const BASE_URL = process.env.NEXTAUTH_URL;

function hasNaveRole(user: any) {
  return user.roles?.some((role: any) => role.role.name === "NAVE");
}

export async function POST(request: NextRequest) {
  console.log("Inicio de la función POST");

  const resetToken = crypto.randomBytes(16).toString("hex");
  const expirationTime = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  try {
    const { email, type } = await request.json();
    console.log("Email y tipo recibidos:", { email, type });

    // Validación de entrada
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ message: "Email inválido." }, { status: 400 });
    }

    if (!type || typeof type !== "string") {
      return NextResponse.json({ message: "Tipo inválido." }, { status: 400 });
    }

    const selectedUser = await db.user.findUnique({
      where: { email: email },
      include: {
        tokens: true,
        roles: { include: { role: true } },
      },
    });

    if (!selectedUser) {
      console.log("Usuario no encontrado:", email);
      return NextResponse.json(
        {
          message:
            "Si su correo está registrado recibirá en su bandeja de entrada el link para poder cambiar su contraseña.",
        },
        { status: 200 }
      );
    }

    if (hasNaveRole(selectedUser)) {
      console.log("Usuario con rol NAVE encontrado:", email);
      return NextResponse.json(
        {
          message: "El rol de este usuario no permite cambiar la contraseña.",
        },
        { status: 200 }
      );
    }

    // Verificar el token existente
    const existingToken = selectedUser.tokens?.find(
      (token) => token.expiresAt > new Date() && !token.used
    );

    if (existingToken) {
      console.log(
        "El usuario ya tiene un token activo y no utilizado para el correo:",
        email
      );
      return NextResponse.json(
        {
          status: "success",
          message:
            "Si su correo está registrado recibirá en su bandeja de entrada el link para poder cambiar su contraseña.",
        },
        { status: 200 }
      );
    }

    // Crear un nuevo token
    const newToken = await db.token.create({
      data: {
        type: "resetUserPassword",
        userId: selectedUser.id,
        token: resetToken,
        url: `${BASE_URL}/auth/forgot-newpassword/${resetToken}`,
        expiresAt: expirationTime,
        used: false,
      },
    });

    if (!newToken || !newToken.url) {
      console.error("Error: No se pudo generar el token correctamente.");
      return NextResponse.json(
        { message: "Error interno al crear el enlace de recuperación." },
        { status: 500 }
      );
    }

    console.log("Nuevo token creado:", { tokenId: newToken.id });

    const emailHtml = resetPasswordEmailHtml(newToken.url, selectedUser.email);
    console.log("HTML del correo preparado");

    const sentEmail = await sendEmail({
      user: { email: selectedUser.email },
      emailHtml,
      content: "Recupera tu contraseña",
    });

    if (!sentEmail || sentEmail instanceof Error) {
      console.error("Error al enviar correo:", sentEmail);
      return NextResponse.json(
        {
          message:
            "Error al enviar el correo de recuperación de contraseña. Por favor, inténtelo más tarde.",
        },
        { status: 500 }
      );
    }

    console.log("Correo enviado exitosamente");

    return NextResponse.json({
      email: selectedUser.email,
      username: selectedUser.username,
      url: newToken.url,
    });
  } catch (error) {
    console.error("Error en la función POST:", error);
    return NextResponse.json(
      {
        message: "Error interno en el servidor.",
      },
      { status: 500 }
    );
  }
}
