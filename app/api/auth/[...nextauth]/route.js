import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const handler = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({ url, baseUrl }) {
      const siteUrl = process.env.NEXTAUTH_URL || 'https://hearly.onrender.com';
      const effectiveBase = siteUrl || baseUrl;
      try {
        const target = new URL(url, effectiveBase);
        if (target.origin === new URL(effectiveBase).origin) return target.toString();
      } catch {}
      if (url.startsWith('/')) return `${effectiveBase}${url}`;
      return effectiveBase;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }
          
          if (!prisma) {
            console.log('Prisma not initialized');
            return null;
          }
          
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }
          
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }
          
          console.log('Login successful for:', credentials.email);
          return { id: user.id, email: user.email, name: user.name };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: { signIn: "/login" },
});

export { handler as GET, handler as POST };


