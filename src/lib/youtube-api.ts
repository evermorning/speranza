import { google } from 'googleapis';

// YouTube API 클라이언트 설정
export class YouTubeAPI {
  private youtube: any;

  constructor(apiKey: string) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
  }

  // 인기 동영상 가져오기 (트렌드 분석용)
  async getTrendingVideos(regionCode: string = 'KR', maxResults: number = 50) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        chart: 'mostPopular',
        regionCode,
        maxResults,
      });

      return response.data.items?.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        duration: video.contentDetails.duration,
        thumbnails: video.snippet.thumbnails,
        tags: video.snippet.tags || [],
        categoryId: video.snippet.categoryId,
      })) || [];
    } catch (error) {
      console.error('YouTube API 오류:', error);
      throw new Error('트렌딩 비디오를 가져오는데 실패했습니다.');
    }
  }

  // 특정 키워드로 동영상 검색
  async searchVideos(query: string, maxResults: number = 25) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: 'video',
        order: 'relevance',
        maxResults,
      });

      return response.data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
      })) || [];
    } catch (error) {
      console.error('YouTube 검색 오류:', error);
      throw new Error('동영상 검색에 실패했습니다.');
    }
  }

  // 카테고리별 트렌드 분석
  async getTrendingByCategory(categoryId: string, regionCode: string = 'KR') {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics'],
        chart: 'mostPopular',
        regionCode,
        videoCategoryId: categoryId,
        maxResults: 25,
      });

      return response.data.items?.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        publishedAt: video.snippet.publishedAt,
        thumbnails: video.snippet.thumbnails,
      })) || [];
    } catch (error) {
      console.error('카테고리별 트렌드 오류:', error);
      throw new Error('카테고리별 트렌드를 가져오는데 실패했습니다.');
    }
  }

  // 동영상 상세 정보 가져오기
  async getVideoDetails(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoId,
      });

      const video = response.data.items?.[0];
      if (!video) return null;

      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        duration: video.contentDetails.duration,
        thumbnails: video.snippet.thumbnails,
        tags: video.snippet.tags || [],
        categoryId: video.snippet.categoryId,
      };
    } catch (error) {
      console.error('동영상 상세 정보 오류:', error);
      throw new Error('동영상 상세 정보를 가져오는데 실패했습니다.');
    }
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

  // 상위 트렌드 동영상 필터링
  static getTopTrendingVideos(videos: any[], limit: number = 10): any[] {
    return videos
      .map(video => ({
        ...video,
        trendScore: this.calculateTrendScore(video),
      }))
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit);
  }
}
