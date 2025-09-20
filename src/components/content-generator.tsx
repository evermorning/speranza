'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ContentGenerator } from '@/lib/content-generator';
import { 
  Lightbulb, 
  FileText, 
  Hash, 
  Calendar, 
  Target, 
  Copy, 
  RefreshCw,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';

interface ContentGeneratorProps {
  trendData: any[];
}

interface UserPreferences {
  channelName: string;
  categories: string[];
  contentTypes: string[];
  targetAudience: string;
}

export default function ContentGeneratorComponent({ trendData }: ContentGeneratorProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    channelName: '',
    categories: ['일반'],
    contentTypes: ['리뷰', '튜토리얼'],
    targetAudience: '일반인'
  });

  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [performancePrediction, setPerformancePrediction] = useState<any>(null);

  const contentGenerator = new ContentGenerator('dummy-key'); // 클라이언트 사이드에서는 API 키가 필요하지 않음

  const generateContent = async () => {
    setLoading(true);
    try {
      const content = await contentGenerator.generateContentIdeas(trendData, preferences);
      setGeneratedContent(content);
    } catch (error) {
      console.error('콘텐츠 생성 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const predictPerformance = (idea: string) => {
    const prediction = contentGenerator.predictPerformance(idea, trendData);
    setPerformancePrediction(prediction);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const categories = [
    '일반', '음악', '게임', '교육', '엔터테인먼트', 
    '뉴스', '과학기술', '여행', '스포츠', '요리'
  ];

  const contentTypes = [
    '리뷰', '튜토리얼', '브이로그', 'Q&A', '챌린지', 
    '라이브', '분석', '비교', '하우투', '뉴스'
  ];

  const targetAudiences = [
    '일반인', '전문가', '초보자', '학생', '직장인', '주부', '청소년'
  ];

  useEffect(() => {
    if (trendData.length > 0) {
      generateContent();
    }
  }, [trendData]);

  return (
    <div className="space-y-6">
      {/* 사용자 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            채널 설정
          </CardTitle>
          <CardDescription>
            AI가 맞춤형 콘텐츠를 생성할 수 있도록 설정해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">채널명</label>
            <Input
              placeholder="채널명을 입력하세요"
              value={preferences.channelName}
              onChange={(e) => setPreferences(prev => ({ ...prev, channelName: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">관심 카테고리</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={preferences.categories.includes(category) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setPreferences(prev => ({
                      ...prev,
                      categories: prev.categories.includes(category)
                        ? prev.categories.filter(c => c !== category)
                        : [...prev.categories, category]
                    }));
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">콘텐츠 유형</label>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map((type) => (
                <Button
                  key={type}
                  variant={preferences.contentTypes.includes(type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setPreferences(prev => ({
                      ...prev,
                      contentTypes: prev.contentTypes.includes(type)
                        ? prev.contentTypes.filter(t => t !== type)
                        : [...prev.contentTypes, type]
                    }));
                  }}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">타겟 오디언스</label>
            <select
              className="w-full p-2 border rounded-md"
              value={preferences.targetAudience}
              onChange={(e) => setPreferences(prev => ({ ...prev, targetAudience: e.target.value }))}
            >
              {targetAudiences.map((audience) => (
                <option key={audience} value={audience}>{audience}</option>
              ))}
            </select>
          </div>

          <Button onClick={generateContent} disabled={loading} className="w-full">
            {loading ? '생성 중...' : '콘텐츠 아이디어 생성'}
          </Button>
        </CardContent>
      </Card>

      {/* 생성된 콘텐츠 아이디어 */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              비디오 아이디어
            </CardTitle>
            <CardDescription>
              AI가 생성한 맞춤형 콘텐츠 아이디어입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {generatedContent.videoIdeas.map((idea: string, index: number) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedIdea === idea ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedIdea(idea);
                    predictPerformance(idea);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{idea}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(idea);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 성과 예측 */}
      {performancePrediction && selectedIdea && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              성과 예측
            </CardTitle>
            <CardDescription>
              선택한 아이디어의 예상 성과를 분석합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">"{selectedIdea}"</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">예상 조회수</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {performancePrediction.estimatedViews.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">신뢰도</p>
                    <p className="text-2xl font-bold text-green-600">
                      {performancePrediction.confidence.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold mb-2">개선 권장사항</h5>
                <ul className="space-y-1">
                  {performancePrediction.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 제목 제안 */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              제목 제안
            </CardTitle>
            <CardDescription>
              클릭하여 복사할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {generatedContent.titleSuggestions.map((title: string, index: number) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => copyToClipboard(title)}
                >
                  <p className="font-medium">{title}</p>
                  <Button size="sm" variant="ghost">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 설명 템플릿 */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              설명 템플릿
            </CardTitle>
            <CardDescription>
              비디오 설명란에 사용할 수 있는 템플릿입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedContent.descriptionTemplates.map((template: string, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">템플릿 {index + 1}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={template}
                    readOnly
                    className="min-h-[100px] resize-none"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 해시태그 제안 */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              해시태그 제안
            </CardTitle>
            <CardDescription>
              비디오에 사용할 수 있는 해시태그입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {generatedContent.hashtagSuggestions.map((hashtag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200"
                  onClick={() => copyToClipboard(hashtag)}
                >
                  {hashtag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 콘텐츠 일정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            콘텐츠 일정 제안
          </CardTitle>
          <CardDescription>
            주간 콘텐츠 업로드 일정을 제안합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {contentGenerator.generateContentSchedule().map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600">{schedule.day}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{schedule.suggestedContent}</p>
                    <p className="text-sm text-gray-600">{schedule.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{schedule.bestTime}</p>
                  <p className="text-xs text-gray-500">최적 시간</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
