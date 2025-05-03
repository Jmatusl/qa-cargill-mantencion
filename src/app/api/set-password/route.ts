import { NextRequest, NextResponse } from "next/server";
import db from "@/libs/db";
import bcrypt from "bcrypt";

interface UserData {
  email: string;
  password: string;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[DEBUG] Inicio del handler POST");

    const data: UserData = await request.json();
    console.log("[DEBUG] Datos recibidos: ", data);

    const userToken = await db.token.findFirst({
      where: {
        token: data.token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    console.log("[DEBUG] Token encontrado: ", userToken);

    if (!userToken) {
      console.log("[ERROR] Token no válido o expirado");
      return NextResponse.json({ message: "Token no válido" }, { status: 400 });
    }

    const findUser = await db.user.findUnique({
      where: {
        email: data.email,
      },
      include: {
        roles: true,
      },
    });
    console.log("[DEBUG] Usuario encontrado: ", findUser);

    if (!findUser) {
      console.log("[ERROR] Usuario no encontrado");
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 400 }
      );
    }

    if (userToken.userId !== findUser.id) {
      console.log("[ERROR] Token no corresponde al usuario");
      return NextResponse.json(
        { message: "Token no corresponde" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log("[DEBUG] Contraseña hasheada correctamente");

    if (userToken.type === "newUserPassword") {
      console.log("[DEBUG] Configurando contraseña para nuevo usuario");
      await db.user.update({
        where: {
          id: findUser.id,
        },
        data: {
          password: hashedPassword,
          verified: true,
          roles: {
            deleteMany: {}, // Elimina todos los roles actuales
            create: [
              {
                role: {
                  connect: {
                    name: "USER", // Conecta al rol "USER"
                  },
                },
              },
            ],
          },
        },
      });
    } else if (userToken.type === "resetUserPassword") {
      console.log("[DEBUG] Reseteando contraseña para usuario existente");
      await db.user.update({
        where: {
          id: findUser.id,
        },
        data: {
          password: hashedPassword,
        },
      });
    }

    await db.token.update({
      where: {
        token: data.token,
      },
      data: {
        used: true,
      },
    });
    console.log("[DEBUG] Token marcado como usado");

    const updatedUser = await db.user.findUnique({
      where: {
        id: findUser.id,
      },
      include: {
        roles: true,
      },
    });
    console.log("[DEBUG] Usuario actualizado: ", updatedUser);

    if (updatedUser) {
      const { password, ...user } = updatedUser;
      console.log("[DEBUG] Respuesta final enviada: ", user);
      return NextResponse.json(user);
    }

    console.log("[ERROR] Error al actualizar usuario");
    return NextResponse.json(
      { message: "Error al actualizar usuario" },
      { status: 500 }
    );
  } catch (error) {
    console.error("[ERROR] Hubo un problema al actualizar la contraseña: ", error);

    // Verifica si el error es una instancia de Error
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // Maneja casos donde el error no sea de tipo Error
    return NextResponse.json(
      { message: "Error desconocido ocurrido." },
      { status: 500 }
    );
  }

}