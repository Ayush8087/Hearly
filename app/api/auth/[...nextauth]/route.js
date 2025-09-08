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
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: { signIn: "/login" },
});

export { handler as GET, handler as POST };


