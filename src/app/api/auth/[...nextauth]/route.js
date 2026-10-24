import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Admin-only sign-in. The single admin account lives in environment variables,
// so there are no admin users in the customer database and no role checks on the storefront.
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? '';

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
        const plain = process.env.ADMIN_PASSWORD;

        if (!adminEmail || (!hash && !plain)) {
          throw new Error('Admin account is not configured on the server');
        }

        let ok = email === adminEmail;
        if (ok) {
          ok = hash ? await bcrypt.compare(password, hash) : password === plain;
        }

        if (!ok) {
          // small delay slows down password guessing
          await new Promise((r) => setTimeout(r, 600));
          throw new Error('Invalid email or password');
        }

        return { id: 'admin', name: 'Admin', email: adminEmail, role: 'admin' };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
