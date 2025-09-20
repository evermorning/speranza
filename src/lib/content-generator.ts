// AI 콘텐츠 생성기 클래스
export class ContentGenerator {
  private openaiApiKey: string;

  constructor(apiKey: string) {
    this.openaiApiKey = apiKey;
  }

  // YouTube API를 사용하지 않고 클라이언트 사이드에서 실행되는 콘텐츠 생성
  async generateContentIdeas(trendData: any[], userPreferences: any) {
    // 트렌드 데이터를 기반으로 콘텐츠 아이디어 생성
    const popularKeywords = this.extractKeywords(trendData);
    const trendingTopics = this.identifyTrendingTopics(trendData);
    
    return {
      videoIdeas: this.generateVideoIdeas(popularKeywords, trendingTopics, userPreferences),
      titleSuggestions: this.generateTitleSuggestions(popularKeywords, userPreferences),
      descriptionTemplates: this.generateDescriptionTemplates(userPreferences),
      hashtagSuggestions: this.generateHashtagSuggestions(popularKeywords),
    };
  }

  // 키워드 추출
  private extractKeywords(trendData: any[]): string[] {
    const keywordCount: { [key: string]: number } = {};
    
    trendData.forEach(video => {
      if (video.tags) {
        video.tags.forEach((tag: string) => {
          const keyword = tag.toLowerCase().trim();
          if (keyword.length > 2) {
            keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(keywordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([keyword]) => keyword);
  }

  // 트렌딩 토픽 식별
  private identifyTrendingTopics(trendData: any[]): string[] {
    const topics: string[] = [];
    
    // 제목에서 자주 나타나는 단어들 추출
    const titleWords: { [key: string]: number } = {};
    
    trendData.forEach(video => {
      const words = video.title.toLowerCase()
        .replace(/[^\w\s가-힣]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      words.forEach(word => {
        titleWords[word] = (titleWords[word] || 0) + 1;
      });
    });

    return Object.entries(titleWords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  // 비디오 아이디어 생성
  private generateVideoIdeas(keywords: string[], topics: string[], preferences: any): string[] {
    const ideas: string[] = [];
    const categories = preferences.categories || ['일반'];
    const contentTypes = preferences.contentTypes || ['리뷰', '튜토리얼', '브이로그'];

    // 키워드 기반 아이디어
    keywords.slice(0, 5).forEach(keyword => {
      contentTypes.forEach(type => {
        ideas.push(`${keyword} ${type} - 최신 트렌드 분석`);
        ideas.push(`${keyword} 완전정복 - ${type} 가이드`);
        ideas.push(`${keyword} 실전 ${type} - 꿀팁 공개`);
      });
    });

    // 토픽 기반 아이디어
    topics.slice(0, 3).forEach(topic => {
      ideas.push(`${topic} 관련 최신 소식 정리`);
      ideas.push(`${topic}에 대한 솔직한 후기`);
      ideas.push(`${topic} 완전 분석 - 모든 것`);
    });

    // 카테고리별 아이디어
    categories.forEach(category => {
      ideas.push(`${category} 카테고리 인기 콘텐츠 분석`);
      ideas.push(`${category}에서 성공하는 방법`);
      ideas.push(`${category} 트렌드 예측`);
    });

    return ideas.slice(0, 20);
  }

  // 제목 제안 생성
  private generateTitleSuggestions(keywords: string[], preferences: any): string[] {
    const suggestions: string[] = [];
    const templates = [
      "{keyword} 완전정복 - {number}분 만에 배우기",
      "놓치면 후회! {keyword} 최신 트렌드",
      "{keyword} 실전 가이드 - 초보자도 OK",
      "화제의 {keyword} - 솔직한 리뷰",
      "{keyword}로 돈 버는 방법",
      "{keyword} 완전 분석 - 모든 것",
      "이것만 알면 OK! {keyword} 꿀팁",
      "{keyword} 비교 분석 - 어떤 게 좋을까?",
      "{keyword} 후기 - 솔직한 평가",
      "{keyword} 트렌드 예측 - 미래는?",
    ];

    keywords.slice(0, 5).forEach(keyword => {
      templates.forEach(template => {
        const number = Math.floor(Math.random() * 30) + 5;
        suggestions.push(
          template
            .replace('{keyword}', keyword)
            .replace('{number}', number.toString())
        );
      });
    });

    return suggestions.slice(0, 30);
  }

  // 설명 템플릿 생성
  private generateDescriptionTemplates(preferences: any): string[] {
    return [
      `안녕하세요! ${preferences.channelName || '여러분'}입니다.

이번 영상에서는 최신 트렌드에 대해 알아보겠습니다.

📌 영상 구성:
- 트렌드 분석
- 실전 적용법
- 주의사항
- 마무리

👍 좋아요와 구독은 영상 제작에 큰 도움이 됩니다!
💬 궁금한 점이 있으시면 댓글로 남겨주세요.

#트렌드 #분석 #유튜브 #콘텐츠`,

      `오늘은 여러분이 궁금해하시는 주제에 대해 자세히 설명드리겠습니다.

🔥 핵심 포인트:
- 포인트 1
- 포인트 2  
- 포인트 3

📚 더 자세한 정보는 아래 링크를 참고하세요.
🔔 알림 설정을 켜두시면 새로운 영상을 놓치지 않으실 수 있습니다.

구독과 좋아요 감사합니다! 🙏`,

      `안녕하세요! 

이번 영상에서는 실생활에 바로 적용할 수 있는 유용한 정보를 공유합니다.

⏰ 타임라인:
00:00 인트로
00:30 본론 시작
02:00 핵심 내용
04:00 실전 적용
05:30 마무리

📞 문의: [이메일 주소]
🌐 블로그: [블로그 주소]

구독과 좋아요 부탁드립니다! 💕`
    ];
  }

  // 해시태그 제안 생성
  private generateHashtagSuggestions(keywords: string[]): string[] {
    const baseHashtags = [
      '#유튜브', '#트렌드', '#분석', '#콘텐츠', '#영상',
      '#인기', '#화제', '#리뷰', '#가이드', '#팁'
    ];

    const keywordHashtags = keywords.slice(0, 10).map(keyword => `#${keyword}`);
    
    return [...baseHashtags, ...keywordHashtags];
  }

  // 콘텐츠 일정 제안
  generateContentSchedule(): any[] {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    const contentTypes = [
      '트렌드 분석', '리뷰', '튜토리얼', '브이로그', 
      'Q&A', '챌린지', '라이브'
    ];

    return days.map((day, index) => ({
      day,
      suggestedContent: contentTypes[index % contentTypes.length],
      bestTime: this.getBestPostingTime(index),
      description: `${day}요일 추천 콘텐츠: ${contentTypes[index % contentTypes.length]}`
    }));
  }

  // 최적 포스팅 시간 제안
  private getBestPostingTime(dayIndex: number): string {
    const timeSlots = [
      '오전 9-10시', '오후 12-1시', '오후 6-7시', '오후 8-9시',
      '오전 10-11시', '오후 2-3시', '오후 7-8시', '오후 9-10시'
    ];
    return timeSlots[dayIndex % timeSlots.length];
  }

  // 성과 예측
  predictPerformance(contentIdea: string, trendData: any[]): any {
    const keywords = this.extractKeywords(trendData);
    const ideaKeywords = contentIdea.toLowerCase().split(/\s+/);
    
    // 키워드 매칭 점수
    const keywordMatch = ideaKeywords.filter(keyword => 
      keywords.some(trendKeyword => trendKeyword.includes(keyword))
    ).length;

    // 예상 조회수 (간단한 휴리스틱)
    const baseViews = 1000;
    const keywordBonus = keywordMatch * 500;
    const estimatedViews = baseViews + keywordBonus;

    return {
      estimatedViews: Math.round(estimatedViews),
      keywordMatchScore: keywordMatch,
      confidence: Math.min(keywordMatch / 3, 1) * 100,
      recommendations: this.getPerformanceRecommendations(keywordMatch)
    };
  }

  // 성과 개선 권장사항
  private getPerformanceRecommendations(keywordMatch: number): string[] {
    const recommendations = [];

    if (keywordMatch === 0) {
      recommendations.push('트렌딩 키워드를 제목에 포함해보세요');
      recommendations.push('인기 있는 주제로 콘텐츠를 수정해보세요');
    } else if (keywordMatch < 2) {
      recommendations.push('더 많은 트렌딩 키워드를 활용해보세요');
      recommendations.push('제목을 더 구체적으로 만들어보세요');
    } else {
      recommendations.push('좋은 키워드 선택입니다!');
      recommendations.push('썸네일과 설명도 최적화해보세요');
    }

    return recommendations;
  }
}
