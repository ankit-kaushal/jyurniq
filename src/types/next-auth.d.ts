import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "editor" | "viewer" | "user";
      emailVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "admin" | "editor" | "viewer" | "user";
    emailVerified?: boolean;
  }
}

