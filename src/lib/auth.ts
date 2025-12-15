import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import NextAuth, { type NextAuthOptions } from "next-auth";
import dbConnect from "@/lib/db";
import User from "@/models/user";

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("NEXTAUTH_SECRET is not set. Sessions may not work properly.");
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production",
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        if (!user.emailVerified) {
          throw new Error("Email not verified");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = (user as { emailVerified?: boolean }).emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin";
        session.user.emailVerified = token.emailVerified as boolean | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

