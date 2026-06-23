import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import getDb from "./db";
import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
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
        const db = getDb();

        if (credentials.isSignUp === "true") {
          // Sign up flow
          const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(credentials.email);
          if (existing) throw new Error("Email already in use");
          const hash = bcrypt.hashSync(credentials.password, 10);
          const id = randomUUID();
          db.prepare("INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, 'applicant')").run(
            id, credentials.email, credentials.name || credentials.email.split("@")[0], hash
          );
          return { id, email: credentials.email, name: credentials.name || credentials.email.split("@")[0], role: "applicant" };
        }

        // Login flow
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(credentials.email) as any;
        if (!user || !user.password) return null;
        const valid = bcrypt.compareSync(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const db = getDb();
        let dbUser = db.prepare("SELECT * FROM users WHERE email = ?").get(user.email!) as any;
        if (!dbUser) {
          const id = randomUUID();
          db.prepare("INSERT INTO users (id, email, name, image, role) VALUES (?, ?, ?, ?, 'applicant')").run(
            id, user.email, user.name, user.image
          );
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
