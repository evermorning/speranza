'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { YouTubeClient, TrendAnalyzer } from '@/lib/youtube-client';
import { TrendingUp, Eye, Heart, MessageCircle, Clock, Tag, Brain } from 'lucide-react';

interface TrendAnalyzerProps {
  apiKey: string;
  onDataUpdate?: (videos: VideoData[]) => void;
}

interface VideoData {
  id: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
  thumbnails: any;
  tags: string[];
  trendScore?: number;
  algorithmScore?: number;
}

export default function TrendAnalyzerComponent({ apiKey, onDataUpdate }: TrendAnalyzerProps) {
  const [trendingVideos, setTrendingVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'trend' | 'views' | 'likes' | 'comments' | 'algorithm'>('views');

  const categories = [
    { id: 'all', name: '전체' },
    { id: '10', name: '음악' },
    { id: '15', name: '애완동물' },
    { id: '17', name: '스포츠' },
    { id: '19', name: '여행' },
    { id: '20', name: '게임' },
    { id: '22', name: '인물' },
    { id: '23', name: '코미디' },
    { id: '24', name: '엔터테인먼트' },
    { id: '25', name: '뉴스' },
    { id: '26', name: '하우투' },
    { id: '27', name: '교육' },
    { id: '28', name: '과학기술' },
  ];

  const youtubeAPI = new YouTubeClient(apiKey);

  const fetchTrendingVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let videos: VideoData[] = [];
      
      if (selectedCategory === 'all') {
        videos = await youtubeAPI.getTrendingVideos('KR', 50);
      } else {
        videos = await youtubeAPI.getTrendingByCategory(selectedCategory, 'KR');
      }
      
      // 트렌드 점수 계산
      const videosWithScore = TrendAnalyzer.getTopTrendingVideos(videos, 20);
      
      // 조회수 기준으로 정렬 (기본값)
      const sortedVideos = videosWithScore.sort((a, b) => b.viewCount - a.viewCount);
      setTrendingVideos(sortedVideos);
      
      // 인기 키워드 추출
      const keywords = TrendAnalyzer.extractPopularKeywords(videos);
      setPopularKeywords(keywords);
      
      // 부모 컴포넌트에 데이터 전달
      if (onDataUpdate) {
        onDataUpdate(sortedVideos);
      }
      
    } catch (err) {
      setError('트렌딩 비디오를 가져오는데 실패했습니다. API 키를 확인해주세요.');
      console.error('Error fetching trending videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchVideos = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const videos = await youtubeAPI.searchVideos(searchQuery, 25);
      const videosWithScore = TrendAnalyzer.getTopTrendingVideos(videos);
      
      // 조회수 기준으로 정렬 (기본값)
      const sortedVideos = videosWithScore.sort((a, b) => b.viewCount - a.viewCount);
      setTrendingVideos(sortedVideos);
      
      // 부모 컴포넌트에 검색 결과 전달
      if (onDataUpdate) {
        onDataUpdate(sortedVideos);
      }
    } catch (err) {
      setError('비디오 검색에 실패했습니다.');
      console.error('Error searching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchTrendingVideos();
    }
  }, [apiKey, selectedCategory]);

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '만';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + '천';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 전`;
    }
  };

  // 정렬 함수
  const sortVideos = (videos: VideoData[], sortType: string) => {
    const sortedVideos = [...videos];
    
    switch (sortType) {
      case 'views':
        return sortedVideos.sort((a, b) => b.viewCount - a.viewCount);
      case 'likes':
        return sortedVideos.sort((a, b) => b.likeCount - a.likeCount);
      case 'comments':
        return sortedVideos.sort((a, b) => b.commentCount - a.commentCount);
      case 'trend':
        return sortedVideos.sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0));
      case 'algorithm':
        return sortedVideos.sort((a, b) => (b.algorithmScore || 0) - (a.algorithmScore || 0));
      default:
        return sortedVideos.sort((a, b) => b.viewCount - a.viewCount); // 기본값을 조회수로 설정
    }
  };

  // 정렬된 비디오 목록
  const sortedVideos = sortVideos(trendingVideos, sortBy);

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            트렌드 분석
          </CardTitle>
          <CardDescription>
            YouTube 트렌딩 비디오를 분석하여 인기 콘텐츠를 파악하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="키워드로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchVideos()}
              className="flex-1"
            />
            <Button onClick={searchVideos} disabled={loading}>
              검색
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
          
           {/* 정렬 옵션 */}
           <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-gray-300">정렬:</span>
             <div className="flex gap-2 flex-wrap">
               <Button
                 variant={sortBy === 'views' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setSortBy('views')}
               >
                 <Eye className="h-4 w-4 mr-1" />
                 조회수
               </Button>
               <Button
                 variant={sortBy === 'algorithm' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setSortBy('algorithm')}
               >
                 <Brain className="h-4 w-4 mr-1" />
                 알고리즘
               </Button>
               <Button
                 variant={sortBy === 'trend' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setSortBy('trend')}
               >
                 <TrendingUp className="h-4 w-4 mr-1" />
                 트렌드
               </Button>
               <Button
                 variant={sortBy === 'likes' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setSortBy('likes')}
               >
                 <Heart className="h-4 w-4 mr-1" />
                 좋아요
               </Button>
               <Button
                 variant={sortBy === 'comments' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setSortBy('comments')}
               >
                 <MessageCircle className="h-4 w-4 mr-1" />
                 댓글
               </Button>
             </div>
           </div>
          
          <Button onClick={fetchTrendingVideos} disabled={loading} className="w-full">
            {loading ? '분석 중...' : '트렌드 새로고침'}
          </Button>
        </CardContent>
      </Card>

      {/* 인기 키워드 */}
      {popularKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              인기 키워드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularKeywords.map((keyword, index) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 분석 대시보드 표 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            분석 대시보드
          </CardTitle>
          <CardDescription>
            YouTube 비디오의 상세 분석 정보를 표 형태로 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold">썸네일</th>
                  <th className="text-left p-3 font-semibold">제목</th>
                  <th className="text-left p-3 font-semibold">채널</th>
                  <th className="text-left p-3 font-semibold">조회수</th>
                  <th className="text-left p-3 font-semibold">좋아요</th>
                  <th className="text-left p-3 font-semibold">댓글</th>
                  <th className="text-left p-3 font-semibold">업로드</th>
                  <th className="text-left p-3 font-semibold">🧠 알고리즘</th>
                  <th className="text-left p-3 font-semibold">📈 트렌드</th>
                </tr>
              </thead>
              <tbody>
                {sortedVideos.map((video, index) => (
                  <tr key={video.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* 썸네일 */}
                    <td className="p-3">
                      <img
                        src={video.thumbnails?.medium?.url || video.thumbnails?.default?.url}
                        alt={video.title}
                        className="w-20 h-15 object-cover rounded"
                      />
                    </td>
                    
                    {/* 제목 */}
                    <td className="p-3 max-w-xs">
                      <div className="font-medium text-sm line-clamp-2" title={video.title}>
                        {video.title}
                      </div>
                    </td>
                    
                    {/* 채널 */}
                    <td className="p-3">
                      <div className="text-sm text-gray-600" title={video.channelTitle}>
                        {video.channelTitle}
                      </div>
                    </td>
                    
                    {/* 조회수 */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Eye className="h-4 w-4 text-gray-500" />
                        {formatNumber(video.viewCount)}
                      </div>
                    </td>
                    
                    {/* 좋아요 */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Heart className="h-4 w-4 text-gray-500" />
                        {formatNumber(video.likeCount)}
                      </div>
                    </td>
                    
                    {/* 댓글 */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm">
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                        {formatNumber(video.commentCount)}
                      </div>
                    </td>
                    
                    {/* 업로드 시간 */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {formatDate(video.publishedAt)}
                      </div>
                    </td>
                    
                    {/* 알고리즘 스코어 */}
                    <td className="p-3">
                      {video.algorithmScore !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                video.algorithmScore >= 80 ? 'bg-green-500' :
                                video.algorithmScore >= 60 ? 'bg-yellow-500' :
                                video.algorithmScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(video.algorithmScore, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold min-w-[3rem]">
                            {video.algorithmScore.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    
                    {/* 트렌드 점수 */}
                    <td className="p-3">
                      {video.trendScore !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${Math.min((video.trendScore / 100) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 min-w-[3rem]">
                            {video.trendScore.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {sortedVideos.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">트렌딩 비디오가 없습니다.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
