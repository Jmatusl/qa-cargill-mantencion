import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getToken } from "next-auth/jwt";
import db from "@/libs/db";
import { Role, User } from "@prisma/client";

type UserRole = {
  role: Role;
};

type UserType = User & { roles: UserRole[] };

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.SECRET,
  });
  if (
    !token ||
    !(token.user as UserType).roles.some((r) => r.role.name === "ADMIN")
  ) {
    return NextResponse.json(
      { message: "No tienes permisos" },
      { status: 401 }
    );
  }

  try {
    const data: UserType = await request.json();
    const userFound = await db.user.findUnique({
      where: { email: data.email },
      include: { roles: { include: { role: true } } },
    });

    if (userFound) {
      return NextResponse.json(
        { message: "Email ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await db.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        verified: true,
        roles: {
          create: data.roles.map((role) => ({
            role: { connect: { name: role.role.name } },
          })),
        },
      },
    });

    const { password, ...user } = newUser;
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Hubo un problema", error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.SECRET,
  });
  const user = token?.user as UserType;

  if (!user?.roles.some((r) => r.role.name === "ADMIN")) {
    return NextResponse.json(
      { message: "No tienes permisos" },
      { status: 401 }
    );
  }

  try {
    const users = await db.user.findMany({
      include: { tokens: true, roles: { include: { role: true } } },
      orderBy: [{ username: "desc" }],
    });

    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    return NextResponse.json(usersWithoutPassword);
  } catch (error) {
    return NextResponse.json(
      { message: "Error en el servidor", error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.SECRET,
  });
  const user = token?.user as UserType;

  if (!user?.roles.some((r) => r.role.name === "ADMIN")) {
    return NextResponse.json(
      { message: "No tienes permisos" },
      { status: 401 }
    );
  }

  try {
    const data: UserType = await request.json();
    const updatedUser = await db.user.update({
      where: { id: data.id },
      data: {
        username: data.username,
        email: data.email,
        roles: {
          deleteMany: {},
          create: data.roles.map((role) => ({
            role: {
              connect: { name: role.role.name },
            },
          })),
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { message: "Error en el servidor", error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.SECRET,
  });
  const user = token?.user as UserType;

  if (!user?.roles.some((r) => r.role.name === "ADMIN")) {
    return NextResponse.json(
      { message: "No tienes permisos" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    await db.token.deleteMany({ where: { userId: parseInt(data.id) } });
    const deletedUser = await db.user.delete({
      where: { id: parseInt(data.id) },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    return NextResponse.json(
      { message: "Error en el servidor", error },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.SECRET,
  });
  const user = token?.user as UserType;

  if (!user?.roles.some((r) => r.role.name === "NEW_USER")) {
    return NextResponse.json(
      { message: "No tienes permisos correspondientes" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const updatedUser = await db.user.update({
      where: { id: data.id },
      data: {
        verified: true,
        password: await bcrypt.hash(data.password, 10),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { message: "Error en el servidor", error },
      { status: 500 }
    );
  }
}
