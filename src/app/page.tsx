'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TrendAnalyzerComponent from '@/components/trend-analyzer';
import ContentGeneratorComponent from '@/components/content-generator';
import { 
  Youtube, 
  TrendingUp, 
  Lightbulb, 
  Settings, 
  BarChart3,
  Sparkles,
  Target,
  Calendar
} from 'lucide-react';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [trendData, setTrendData] = useState([]);
  const [activeTab, setActiveTab] = useState('trend');
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

  const tabs = [
    { id: 'trend', label: '트렌드 분석', icon: TrendingUp },
    { id: 'content', label: '콘텐츠 생성', icon: Lightbulb },
    { id: 'analytics', label: '분석 대시보드', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Youtube className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Speranza</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                AI 콘텐츠 어시스턴트
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Settings className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API 키 설정 */}
        {!isConfigured ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Youtube className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">YouTube API 설정</CardTitle>
                <CardDescription>
                  YouTube 트렌드 분석을 위해 API 키가 필요합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube Data API v3 키
                  </label>
                  <Input
                    type="password"
                    placeholder="API 키를 입력하세요"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-500">
                    API 키는 브라우저에 안전하게 저장됩니다
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">API 키 발급 방법</h4>
                  <ol className="text-sm text-yellow-700 space-y-1">
                    <li>1. <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a>에 접속</li>
                    <li>2. 새 프로젝트 생성 또는 기존 프로젝트 선택</li>
                    <li>3. "API 및 서비스" → "라이브러리"에서 "YouTube Data API v3" 활성화</li>
                    <li>4. "사용자 인증 정보" → "사용자 인증 정보 만들기" → "API 키"</li>
                    <li>5. 생성된 API 키를 복사하여 입력</li>
                  </ol>
                </div>

                <Button 
                  onClick={handleApiKeySubmit} 
                  disabled={!apiKey.trim()}
                  className="w-full"
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  AI 기반 YouTube 콘텐츠 어시스턴트
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  YouTube 트렌드를 분석하고 AI가 맞춤형 콘텐츠 아이디어를 생성해드립니다. 
                  성공적인 유튜버가 되기 위한 모든 도구를 제공합니다.
                </p>
              </div>

              {/* 기능 카드들 */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>트렌드 분석</CardTitle>
                    <CardDescription>
                      실시간 YouTube 트렌드를 분석하여 인기 콘텐츠를 파악합니다
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Lightbulb className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle>AI 콘텐츠 생성</CardTitle>
                    <CardDescription>
                      AI가 당신의 채널에 맞는 맞춤형 콘텐츠 아이디어를 생성합니다
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle>성과 예측</CardTitle>
                    <CardDescription>
                      콘텐츠 아이디어의 예상 성과를 분석하고 개선 방안을 제시합니다
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="space-y-6">
              {activeTab === 'trend' && (
                <TrendAnalyzerComponent apiKey={apiKey} />
              )}
              
              {activeTab === 'content' && (
                <ContentGeneratorComponent trendData={trendData} />
              )}
              
              {activeTab === 'analytics' && (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">분석 대시보드</h3>
                  <p className="text-gray-500">곧 출시될 예정입니다</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 Speranza. AI 기반 YouTube 콘텐츠 어시스턴트</p>
          </div>
        </div>
      </footer>
    </div>
  );
}