// 클라이언트 사이드에서 사용할 YouTube API 클라이언트
export class YouTubeClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // 인기 동영상 가져오기 (트렌드 분석용)
  async getTrendingVideos(regionCode: string = 'KR', maxResults: number = 50, categoryId?: string) {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        regionCode,
        maxResults: maxResults.toString(),
      });

      if (categoryId && categoryId !== 'all') {
        params.append('categoryId', categoryId);
      }

      const response = await fetch(`/api/youtube/trending?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API 요청에 실패했습니다.');
      }

      const data = await response.json();
      return data.videos;
    } catch (error) {
      console.error('YouTube API 오류:', error);
      throw new Error('트렌딩 비디오를 가져오는데 실패했습니다.');
    }
  }

  // 특정 키워드로 동영상 검색
  async searchVideos(query: string, maxResults: number = 25) {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        query,
        maxResults: maxResults.toString(),
      });

      const response = await fetch(`/api/youtube/search?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API 요청에 실패했습니다.');
      }

      const data = await response.json();
      return data.videos;
    } catch (error) {
      console.error('YouTube 검색 오류:', error);
      throw new Error('동영상 검색에 실패했습니다.');
    }
  }

  // 카테고리별 트렌드 분석
  async getTrendingByCategory(categoryId: string, regionCode: string = 'KR') {
    return this.getTrendingVideos(regionCode, 25, categoryId);
  }
}

// 트렌드 분석 유틸리티 함수들
export class TrendAnalyzer {
  // 인기 키워드 추출
  static extractPopularKeywords(videos: any[]): string[] {
    const keywordCount: { [key: string]: number } = {};
    
    videos.forEach(video => {
      if (video.tags) {
        video.tags.forEach((tag: string) => {
          const keyword = tag.toLowerCase();
          keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
        });
      }
    });

    return Object.entries(keywordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([keyword]) => keyword);
  }

  // 카테고리별 성과 분석
  static analyzeCategoryPerformance(videos: any[]): { [key: string]: any } {
    const categoryStats: { [key: string]: any } = {};

    videos.forEach(video => {
      const category = video.categoryId || 'unknown';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalViews: 0,
          totalLikes: 0,
          avgViews: 0,
          avgLikes: 0,
        };
      }

      categoryStats[category].count++;
      categoryStats[category].totalViews += video.viewCount || 0;
      categoryStats[category].totalLikes += video.likeCount || 0;
    });

    // 평균 계산
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.avgViews = Math.round(stats.totalViews / stats.count);
      stats.avgLikes = Math.round(stats.totalLikes / stats.count);
    });

    return categoryStats;
  }

  // 트렌드 점수 계산
  static calculateTrendScore(video: any): number {
    const viewCount = video.viewCount || 0;
    const likeCount = video.likeCount || 0;
    const commentCount = video.commentCount || 0;
    const publishedAt = new Date(video.publishedAt);
    const now = new Date();
    const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

    // 시간 가중치 (최근일수록 높은 점수)
    const timeWeight = Math.max(0, 1 - (hoursSincePublished / 168)); // 1주일 기준

    // 참여도 점수 (좋아요 + 댓글)
    const engagementScore = (likeCount + commentCount * 2) / Math.max(viewCount, 1);

    // 최종 트렌드 점수
    return (viewCount * timeWeight * (1 + engagementScore)) / 1000000;
  }

  // YouTube 알고리즘 스코어 계산
  static calculateAlgorithmScore(video: any): number {
    const viewCount = video.viewCount || 0;
    const likeCount = video.likeCount || 0;
    const commentCount = video.commentCount || 0;
    const publishedAt = new Date(video.publishedAt);
    const now = new Date();
    const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

    // 1. 조회수 점수 (0-40점)
    const viewScore = Math.min(40, (viewCount / 1000000) * 40);

    // 2. 참여도 점수 (0-25점)
    const engagementRate = (likeCount + commentCount * 2) / Math.max(viewCount, 1);
    const engagementScore = Math.min(25, engagementRate * 1000 * 25);

    // 3. 시간 신선도 점수 (0-20점)
    const freshnessScore = Math.max(0, 20 * (1 - hoursSincePublished / 72)); // 3일 기준

    // 4. 상호작용 속도 점수 (0-15점)
    const interactionSpeed = (likeCount + commentCount) / Math.max(hoursSincePublished, 1);
    const speedScore = Math.min(15, interactionSpeed / 100 * 15);

    // 총점 계산 (0-100점)
    const totalScore = viewScore + engagementScore + freshnessScore + speedScore;
    
    return Math.min(100, Math.max(0, totalScore));
  }

  // 상위 트렌드 동영상 필터링
  static getTopTrendingVideos(videos: any[], limit: number = 10): any[] {
    return videos
      .map(video => ({
        ...video,
        trendScore: this.calculateTrendScore(video),
        algorithmScore: this.calculateAlgorithmScore(video),
      }))
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit);
  }
}
