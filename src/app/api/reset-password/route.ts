import crypto from "crypto";

import db from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/apiServices/emailServices";
import { resetPasswordEmailHtml } from "@/emailContent/reset-password";
import { getToken } from "next-auth/jwt";
import { User, Role } from "@prisma/client";

interface UserType extends User {
  role: Role;
}

const BASE_URL = process.env.NEXTAUTH_URL;

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request as NextRequest,
    secret: process.env.SECRET,
  });

  console.log("role", token);
  function isUserAdmin(data: any) {
    return data.user.roles.some((role: any) => role.role.name === "ADMIN");
  }

  // console.log("isAdmin", isUserAdmin(token));

  if (!isUserAdmin(token)) {
    return NextResponse.json(
      { message: "No tienes permisos" },
      { status: 401 }
    );
  }

  const userToken = crypto.randomBytes(16).toString("hex");
  const expirationTime = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  const { email, type } = await request.json();

  const selectedUser = await db.user.findUnique({
    where: {
      email: email,
    },
    include: {
      tokens: true,
    },
  });

  if (!selectedUser) {
    return NextResponse.json(
      { message: "Usuario no encontrado" },
      { status: 400 }
    );
  }

  const newToken = await db.token.create({
    data: {
      type: type,
      userId: selectedUser.id,
      token: userToken,
      url: `${BASE_URL}/auth/newpassword/${userToken}`,
      expiresAt: expirationTime,
    },
  });

  if (!newToken) {
    return NextResponse.json(
      { message: "Error al crear token" },
      { status: 500 }
    );
  }

  const emailHtml = resetPasswordEmailHtml(
    newToken.url as string,
    selectedUser.email
  );

  const sentEmail = await sendEmail({
    user: { email: selectedUser.email },
    emailHtml,
    content: "Recupera tu contraseña",
  });

  if (sentEmail instanceof Error) {
    return NextResponse.json({
      message: "Error al enviar correo",
      email: selectedUser.email,
      username: selectedUser.username,
      url: newToken.url,
    });
  }
  console.log("Correo enviado:", sentEmail);

  return NextResponse.json({
    email: selectedUser.email,
    username: selectedUser.username,
    url: newToken.url,
    sentEmail,
  });
}
