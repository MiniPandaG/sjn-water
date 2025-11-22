import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      barrio?: {
        id: number;
        nombre: string;
      };
    };
  }

  interface User {
    role: string;
    barrio?: {
      id: number;
      nombre: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    barrio?: {
      id: number;
      nombre: string;
    };
  }
}