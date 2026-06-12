import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authApi } from '@/lib/api';
import { Role } from '@/types';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
  }
  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    role: Role;
    userId: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        let res;
        try {
          res = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          });
        } catch (e) {
          console.error('authorize: authApi.login threw', e);
          return null;
        }

        if (!res || !res.success || !res.data) {
          console.error('authorize: login failed', { res });
          return null;
        }

        const { user, accessToken, refreshToken } = res.data as any;
        const out = {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role as Role,
          accessToken,
          refreshToken,
        };
        // Debug: surface successful authorize
        // eslint-disable-next-line no-console
        console.error('authorize: success', { user: out });
        return out;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.userId;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt', maxAge: 30 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
