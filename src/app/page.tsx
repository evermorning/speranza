'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TrendAnalyzerComponent from '@/components/trend-analyzer';
import { 
  Youtube, 
  TrendingUp, 
  Settings, 
  Sparkles
} from 'lucide-react';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [apiKey, setApiKey] = useState('');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('trend');
  const [isConfigured, setIsConfigured] = useState(false);

  // 로그인하지 않은 사용자도 홈페이지에 접근할 수 있도록 주석 처리
  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/auth/signin');
  //   }
  // }, [status, router]);

  useEffect(() => {
    const showWelcome = localStorage.getItem('showWelcome');
    if (showWelcome === 'true' && session?.user) {
      // 환영 메시지 표시
      alert(`환영합니다, ${session.user.name || session.user.email}님!`);
      // 메시지를 한 번만 표시하도록 상태 제거
      localStorage.removeItem('showWelcome');
    }
  }, [session]);

  const handleApiKeySubmit = async () => {
    if (!session?.user?.email) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (apiKey.trim()) {
      // 로그인한 사용자: 서버에 API 키 저장
      try {
        const response = await fetch('/api/user/api-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            apiKey: apiKey.trim(),
            userEmail: session.user.email 
          }),
        });

        if (response.ok) {
          setIsConfigured(true);
          alert('API 키가 성공적으로 저장되었습니다!');
        } else {
          const error = await response.json();
          alert(`API 키 저장 실패: ${error.error}`);
        }
      } catch (error) {
        console.error('API key save error:', error);
        alert('API 키 저장 중 오류가 발생했습니다.');
      }
    }
  };

  useEffect(() => {
    const loadApiKey = async () => {
      if (session?.user?.email) {
        // 로그인한 사용자: 서버에서 API 키 조회
        try {
          const response = await fetch(`/api/user/api-key/full?email=${encodeURIComponent(session.user.email)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.hasApiKey && data.apiKey) {
              setApiKey(data.apiKey);
              setIsConfigured(true);
            } else {
              // API 키가 없는 경우 설정 화면으로
              setIsConfigured(false);
            }
          }
        } catch (error) {
          console.error('Failed to load user API key:', error);
          setIsConfigured(false);
        }
      } else {
        // 로그인하지 않은 사용자: 로그인 화면으로 유도
        // 기존 로컬 스토리지 정리
        localStorage.removeItem('youtube-api-key');
        setIsConfigured(false);
      }
    };

    loadApiKey();
  }, [session]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* 헤더 */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Youtube className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Speranza</h1>
              <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs font-medium rounded-full">
                AI 콘텐츠 어시스턴트
              </span>
            </div>
            <div className="flex items-center gap-4">
              {session?.user ? (
                <>
                  <span className="text-sm text-gray-300">
                    {session.user.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-gray-300 hover:text-white"
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/signin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      로그인
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      회원가입
                    </Button>
                  </Link>
                </div>
              )}
              <Settings className="h-5 w-5 text-gray-300" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!session?.user ? (
          // 미로그인 사용자: 로그인 유도 화면
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Youtube className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Speranza에 오신 것을 환영합니다!</CardTitle>
                <CardDescription className="text-gray-300">
                  YouTube 트렌드 분석을 위해 먼저 로그인해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gray-700 rounded-lg">
                  <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2 text-lg">개인 맞춤 트렌드 분석</h3>
                  <p className="text-gray-300">
                    로그인하시면 개인 YouTube API 키를 안전하게 저장하고 
                    언제든지 트렌드 분석을 이용하실 수 있습니다.
                  </p>
                </div>
                
                <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">로그인 후 이용 가능한 기능</h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• 개인 YouTube API 키 안전 저장</li>
                    <li>• 실시간 YouTube 트렌드 분석</li>
                    <li>• 키워드 기반 검색 및 분석</li>
                    <li>• 개인화된 콘텐츠 추천</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/auth/signin" className="flex-1">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      로그인하기
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                      회원가입하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !isConfigured ? (
          // 로그인한 사용자: API 키 설정 화면
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">YouTube API 키 설정</CardTitle>
                <CardDescription className="text-gray-300">
                  개인 전용 YouTube API 키를 설정하여 트렌드 분석을 시작하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-300 mb-2">계정별 API 키 관리</h4>
                  <p className="text-sm text-blue-200">
                    로그인한 계정마다 개별 YouTube API 키를 안전하게 저장합니다. 
                    한 번 설정하면 자동으로 로드됩니다.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    YouTube Data API v3 키
                  </label>
                  <Input
                    type="password"
                    placeholder="API 키를 입력하세요"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mb-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400">
                    API 키는 서버에 안전하게 저장됩니다
                  </p>
                </div>
                
                <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-300 mb-2">API 키 발급 방법</h4>
                  <ol className="text-sm text-yellow-200 space-y-1">
                    <li>1. <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-yellow-300">Google Cloud Console</a>에 접속</li>
                    <li>2. 새 프로젝트 생성 또는 기존 프로젝트 선택</li>
                    <li>3. "API 및 서비스" → "라이브러리"에서 "YouTube Data API v3" 활성화</li>
                    <li>4. "사용자 인증 정보" → "사용자 인증 정보 만들기" → "API 키"</li>
                    <li>5. 생성된 API 키를 복사하여 입력</li>
                  </ol>
                </div>

                <Button 
                  onClick={handleApiKeySubmit} 
                  disabled={!apiKey.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  API 키 저장하기
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 로그인하지 않은 사용자에게 안내 메시지 */}
            {!session?.user && (
              <Card className="bg-blue-900 border-blue-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Youtube className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-100">YouTube 트렌드 분석 기능</h3>
                      <p className="text-blue-200 text-sm">
                        로그인하시면 개인 API 키를 저장하고 더 많은 기능을 이용하실 수 있습니다.
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Link href="/auth/signin">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          로그인
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 로그인한 사용자에게 API 키 관리 옵션 제공 */}
            {session?.user && (
              <Card className="bg-green-900 border-green-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-100">개인 API 키 설정 완료!</h3>
                      <p className="text-green-200 text-sm">
                        계정에 저장된 API 키로 트렌드 분석을 이용 중입니다.
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setIsConfigured(false)}
                      >
                        API 키 변경
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <TrendAnalyzerComponent 
              apiKey={apiKey}
              isLoggedIn={!!session?.user}
            />
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Speranza. AI 기반 YouTube 콘텐츠 어시스턴트</p>
          </div>
        </div>
      </footer>
    </div>
  );
}