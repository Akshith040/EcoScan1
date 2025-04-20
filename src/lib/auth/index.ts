import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Check if we have credentials
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find the user in the database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // If no user is found or password doesn't match, return null
          if (!user) {
            return null;
          }

          // Compare the provided password with the stored hashed password
          const passwordMatch = await compare(credentials.password, user.password);

          if (!passwordMatch) {
            return null;
          }

          // Return the user object without the password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Respect the callback URL if it's provided and is safe
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Otherwise return to the URL they came from or the base URL
      return url.startsWith("/") ? `${baseUrl}${url}` : baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "YOUR_FALLBACK_SECRET_DO_NOT_USE_IN_PRODUCTION",
};

export const getAuthSession = () => getServerSession(authOptions);