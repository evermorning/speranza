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

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setIsConfigured(true);
      // API 키를 로컬 스토리지에 저장
      localStorage.setItem('youtube-api-key', apiKey);
    }
  };

  useEffect(() => {
    // 페이지 로드 시 저장된 API 키 확인
    const savedApiKey = localStorage.getItem('youtube-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsConfigured(true);
    }
  }, []);


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
              <Settings className="h-5 w-5 text-gray-300" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API 키 설정 */}
        {!isConfigured ? (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Youtube className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">YouTube API 설정</CardTitle>
                <CardDescription className="text-gray-300">
                  YouTube 트렌드 분석을 위해 API 키가 필요합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    API 키는 브라우저에 안전하게 저장됩니다
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
                  <Sparkles className="h-4 w-4 mr-2" />
                  시작하기
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* 기능 소개 */}
            <div className="mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  AI 기반 YouTube 콘텐츠 어시스턴트
                </h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  YouTube 트렌드를 분석하고 AI가 맞춤형 콘텐츠 아이디어를 생성해드립니다. 
                  성공적인 유튜버가 되기 위한 모든 도구를 제공합니다.
                </p>
              </div>

              {/* 기능 카드들 */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">트렌드 분석</CardTitle>
                    <CardDescription className="text-gray-300">
                      실시간 YouTube 트렌드를 분석하여 인기 콘텐츠를 파악합니다
                    </CardDescription>
                  </CardHeader>
                </Card>



              </div>
            </div>


            {/* 트렌드 분석 컴포넌트 */}
            <div className="space-y-6">
              <TrendAnalyzerComponent 
                apiKey={apiKey} 
              />
            </div>
          </>
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