import { NextRequest, NextResponse } from "next/server";
import db from "@/libs/db";

// Function to load roles
const loadRoles = async () => {
  try {
    const roles = [
      {
        name: "NEW_USER",
        description: "Usuario recién registrado con acceso limitado",
      },
      { name: "USER", description: "Usuario regular con acceso estándar" },
      { name: "ADMIN", description: "Administrador con acceso completo" },
      { name: "NAVE", description: "Rol de Nave para gestión de barcos" },
      {
        name: "MANTENCION",
        description: "Rol de Mantención para tareas de mantenimiento",
      },
      {
        name: "JEFE_AREA",
        description: "Jefe de área con responsabilidades de supervisión",
      },
      {
        name: "GERENTE_OOPP",
        description: "Gerente de operaciones con privilegios ejecutivos",
      },
    ];

    for (const role of roles) {
      await db.role.upsert({
        where: { name: role.name },
        update: {},
        create: role,
      });
    }

    return true;
  } catch (error) {
    console.error("Error loading roles:", error);
    throw error;
  }
};

// Function to load users with ADMIN role
const loadUsersWithAdminRole = async () => {
  try {
    // Find the ADMIN role
    const adminRole = await db.role.findUnique({
      where: { name: "ADMIN" },
    });

    if (!adminRole) {
      throw new Error("Admin role not found");
    }

    for (const user of users) {
      const createdUser = await db.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          username: user.username,
          password: user.password,
          verified: true,
        },
      });

      await db.userRole.create({
        data: {
          userId: createdUser.id,
          roleId: adminRole.id,
        },
      });
    }

    console.log("Users loaded successfully with ADMIN role");
  } catch (error) {
    console.error("Error loading users:", error);
    throw error;
  }
};

// Function to clean the User and Role tables
const cleanTables = async () => {
  try {
    await db.userRole.deleteMany({});
    await db.maintenanceRequestOnUser.deleteMany({});
    await db.token.deleteMany({});
    await db.user.deleteMany({});
    await db.role.deleteMany({});
    console.log("Tables cleaned successfully");
  } catch (error) {
    console.error("Error cleaning tables:", error);
    throw error;
  }
};

// POST request handler
export async function POST(request: NextRequest) {
  try {
    await cleanTables();
    await loadRoles();
    await loadUsersWithAdminRole();
    return NextResponse.json({
      message: "Users and roles loaded successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error loading users and roles" },
      { status: 500 }
    );
  }
}

// GET request handler
export function GET() {
  return db.role
    .findMany({
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    })
    .then((roles) => {
      console.log("Roles loaded successfully");
      return NextResponse.json(roles);
    })
    .catch((error) => {
      console.error("Error loading roles:", error);
      return NextResponse.json(
        { message: "Error loading roles" },
        { status: 500 }
      );
    });
}

const users = [
  {
    email: "patricio.gomez@sotex.cl",
    username: "PRGM",
    password: "$2b$10$Sgnl7F9AZyslkoBCDPwY9e3a4I.IDXImpnSTgFKN06HaBrXhjgjRO",
  },
  {
    email: "gabriela.cea@sotex.cl",
    username: "Gabriela Cea",
    password: "$2b$10$JFr2ELRxlsImYejCfKuOqe3OWYCM28bxAG7FlB6G5Sp9XTpal/0Re",
  },
  {
    email: "daniela.lubbert@sotex.cl",
    username: "Daniela Lübbert",
    password: "$2b$10$gfGO3y3vimDLlYTikeJWlutfH9hO9Q6kyMjYJZbKF3PtIqOGutpOK",
  },
];
