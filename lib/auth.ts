import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            barrio: true
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          barrio: user.barrio
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
// lib/auth.ts
callbacks: {
  async jwt({ token, user, trigger, session }) {
    // Cuando el usuario inicia sesión
    if (user) {
      token.role = user.role;
      token.barrio = user.barrio;
    }

    // Actualizar el token cuando se dispara una actualización de sesión
    if (trigger === "update" && session?.barrio) {
      token.barrio = session.barrio;
    }

    // Siempre devolver el token actualizado
    return token;
  },
  async session({ session, token }) {
    session.user.id = token.sub!;
    session.user.role = token.role;
    session.user.barrio = token.barrio;
    return session;
  }
},
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register"
  }
};