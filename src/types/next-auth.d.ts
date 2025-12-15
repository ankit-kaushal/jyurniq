import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      emailVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "user" | "admin";
    emailVerified?: boolean;
  }
}

