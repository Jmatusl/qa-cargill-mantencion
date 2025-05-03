import db from "@/libs/db";
import {
  PrismaClient,
  User as PrismaUser,
  Role as PrismaRole,
  Responsible as PrismaResponsible,
} from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";

export async function verifyUserToken(token: string) {
  const userToken = await db.token.findUnique({
    where: {
      token: token,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  return userToken || null;
}

export async function verifyUserTokenWithEmail(userToken: string) {
  const tokenData = await db.token.findUnique({
    where: { token: userToken },
    include: { user: true }, // Incluye la información del usuario
  });

  if (!tokenData) {
    return null; // Token inválido
  }

  return {
    valid: true,
    used: tokenData.used,
    email: tokenData.user.email, // Devuelve el email del usuario
  };
}

// Define the UserRole type based on your database schema
interface UserRole {
  role: PrismaRole;
}

// Define the UserType to include the roles
type UserType = PrismaUser & {
  roles: UserRole[];
  responsible: PrismaResponsible;
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials) return null;
      
        // Buscar el usuario en la base de datos
        const userFound = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    Ships: true,
                  },
                },
              },
            },
            responsible: true,
          },
        });
      
        if (!userFound || !userFound.password) throw new Error("No user found");
      
        // Comparación de contraseñas
        const passwordValid = await bcrypt.compare(
          credentials.password,
          userFound.password
        );
      
      
        if (!passwordValid) throw new Error("Invalid password");
      
        // Verificación de roles
        const userRoles = userFound.roles.map((userRole) => userRole.role.name);
        if (userRoles.includes("NEW_USER")) {
          throw new Error("Cuenta no validada para acceder a la aplicación");
        }
      
        console.log("Último login:", userFound.lastLogin);
      
        // Actualizar el último login
        await db.user.update({
          where: {
            id: userFound.id,
          },
          data: {
            lastLogin: new Date(),
          },
        });
      
        // Remover la contraseña antes de retornar el usuario
        const { password, ...safeUser } = userFound;
      
        return safeUser as unknown as UserType;
      }
      
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT & { user?: UserType };
      user?: UserType;
    }) {
      if (user) {
        token.user = user; // Cast user to UserType
        token.roles = user.roles.map((userRole) => userRole.role); // Include roles in token
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: { user?: UserType; roles?: PrismaRole[] };
      token: JWT & { user?: UserType; roles?: PrismaRole[] };
    }) {
      session.user = token.user; // Cast token.user to UserType
      session.roles = token.roles; // Include roles in session
      //  console.log("session", session);

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },

  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.SECRET,
};
