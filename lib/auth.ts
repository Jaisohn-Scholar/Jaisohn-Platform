import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql, ensureDb } from "./db";
import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignUp: { label: "Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await ensureDb();

        if (credentials.isSignUp === "true") {
          const existing = await sql`SELECT id FROM users WHERE email = ${credentials.email}`;
          if (existing.rows.length > 0) throw new Error("Email already in use");
          const hash = bcrypt.hashSync(credentials.password, 10);
          const id = randomUUID();
          const displayName = credentials.name || credentials.email.split("@")[0];
          await sql`INSERT INTO users (id, email, name, password, role) VALUES (${id}, ${credentials.email}, ${displayName}, ${hash}, 'applicant')`;
          return { id, email: credentials.email, name: displayName, role: "applicant" } as any;
        }

        const result = await sql`SELECT * FROM users WHERE email = ${credentials.email}`;
        if (result.rows.length === 0) return null;
        const user = result.rows[0];
        if (!user.password || !bcrypt.compareSync(credentials.password, user.password)) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await ensureDb();
        const result = await sql`SELECT * FROM users WHERE email = ${user.email!}`;
        let dbUser = result.rows[0];
        if (!dbUser) {
          const id = randomUUID();
          await sql`INSERT INTO users (id, email, name, image, role) VALUES (${id}, ${user.email}, ${user.name}, ${user.image}, 'applicant')`;
          dbUser = { id, role: "applicant" };
        }
        (user as any).role = dbUser.role;
        (user as any).dbId = dbUser.id;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.dbId = (user as any).dbId || user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.dbId || token.sub;
      }
      return session;
    },
  },
};
