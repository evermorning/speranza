import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { userDb } from '@/lib/supabase';

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || 'speranza-development-secret-key-2024-v3-fixed',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: true, // 개발 환경에서 디버그 활성화
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('이메일과 비밀번호를 입력해주세요');
          }

          console.log('Attempting login for email:', credentials.email);
          const user = await userDb.findByEmail(credentials.email);
          
          if (!user) {
            console.log('User not found');
            throw new Error('사용자를 찾을 수 없습니다');
          }

          console.log('Found user:', { id: user.id, email: user.email, name: user.name });
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Invalid password');
            throw new Error('비밀번호가 일치하지 않습니다');
          }

          console.log('Login successful');
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'user', // 역할 정보 포함 (기본값: user)
          };
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      try {
        if (token && session.user) {
          const user = await userDb.findByEmail(session.user.email!);
          if (user) {
            session.user.id = user.id;
            session.user.provider = user.provider;
            session.user.role = user.role || 'user'; // 역할 정보 세션에 포함
          }
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        // JWT 오류가 발생하면 빈 세션 반환
        return { user: null, expires: '' };
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (account && user) {
          token.accessToken = account.access_token;
          token.userId = user.id;
          token.provider = account.provider;
        }
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        // JWT 오류가 발생하면 새로운 토큰 생성
        return {};
      }
    },
  },
});

export { handler as GET, handler as POST };