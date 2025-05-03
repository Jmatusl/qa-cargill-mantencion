import db from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { newUserEmailHtml } from "@/emailContent/newUser";
import { sendEmail } from "@/apiServices/emailServices";
import { getToken } from "next-auth/jwt";
import { User, Role } from "@prisma/client";

type UserRole = {
  role: Role;
};

type UserType = User & { roles: UserRole[] };

const BASE_URL = process.env.NEXTAUTH_URL;

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.SECRET,
  });
  console.log(token);
  if (
    !token ||
    !(token.user as UserType).roles.some((r) => r.role.name === "ADMIN")
  ) {
    return NextResponse.json(
      { message: "No tienes permisos" },
      { status: 401 }
    );
  }

  const userToken = crypto.randomBytes(16).toString("hex");
  const expirationTime = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const requestData = await request.json();
  const userExist = await db.user.findFirst({
    where: {
      email: requestData.email,
    },
  });

  if (userExist) {
    return NextResponse.json(
      {
        message: "Usuario ya existe",
        email: userExist.email,
        username: userExist.username,
      },
      { status: 400 }
    );
  }

  const user = await db.user.create({
    data: {
      email: requestData.email,
      username: requestData.username,
      password: "",
      verified: false,
      roles: { create: { role: { connect: { name: "NEW_USER" } } } }, // Corrected this line to match the schema
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Error al crear usuario" },
      { status: 500 }
    );
  }

  const tokenExist = await db.token.findFirst({
    where: {
      userId: user.id,
      type: "newUserPassword",
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (tokenExist) {
    return NextResponse.json({
      message: "Ya existe un Token valido",
      email: user.email,
      username: user.username,
    });
  }

  const verificationToken = await db.token.create({
    data: {
      userId: user.id,
      token: userToken,
      url: `${BASE_URL}/auth/newpassword/${userToken}`,
      type: "newUserPassword",
      expiresAt: expirationTime,
    },
  });

  if (!verificationToken) {
    return NextResponse.json(
      { message: "Error al crear token" },
      { status: 500 }
    );
  }

  const emailHtml = newUserEmailHtml(
    verificationToken.url as string,
    requestData.email
  );

  const sentEmail = await sendEmail({
    user: { email: requestData.email },
    emailHtml,
    content: "Verifica tu dirección de correo electrónico",
  });

  if (sentEmail instanceof Error) {
    return NextResponse.json({
      message: "Error al enviar correo",
      email: user.email,
      username: user.username,
      url: verificationToken.url,
    });
  }
  console.log("Correo enviado:", sentEmail);

  return NextResponse.json({
    email: user.email,
    username: user.username,
    link: verificationToken.url,
    sentEmail,
  });
}
