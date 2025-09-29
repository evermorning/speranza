'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Youtube, Mail } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with email:', email);
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      console.log('Login result:', result);

      if (result?.error) {
        console.error('Login error:', result.error);
        if (result.error === '사용자를 찾을 수 없습니다') {
          setError('등록되지 않은 이메일입니다');
        } else if (result.error === '비밀번호가 일치하지 않습니다') {
          setError('비밀번호가 일치하지 않습니다');
        } else {
          setError('로그인에 실패했습니다');
        }
      } else {
        console.log('Login successful, redirecting...');
        router.push('/');
        localStorage.setItem('showWelcome', 'true');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('로그인 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Youtube className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">로그인</CardTitle>
          <CardDescription className="text-gray-300">
            YouTube 트렌드 분석을 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">이메일</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">비밀번호</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {loading ? '로그인 중...' : '이메일로 로그인'}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <Link
              href="/auth/signup"
              className="text-sm text-gray-400 hover:text-white block"
            >
              계정이 없으신가요? 회원가입하기
            </Link>
            <Link
              href="/auth/reset-password"
              className="text-sm text-gray-400 hover:text-white block"
            >
              비밀번호를 잊으셨나요? 비밀번호 변경
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}