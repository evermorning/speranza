import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const query = searchParams.get('query');
    const maxResults = parseInt(searchParams.get('maxResults') || '25');

    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });
    }

    if (!query) {
      return NextResponse.json({ error: '검색 쿼리가 필요합니다.' }, { status: 400 });
    }

    // YouTube Data API v3 직접 호출
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=relevance&maxResults=${maxResults}&key=${apiKey}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'YouTube API 요청에 실패했습니다.');
    }

    const data = await response.json();
    const videoIds = data.items?.map((item: any) => item.id.videoId) || [];
    
    // Fetch video statistics
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();

    const videos = statsData.items?.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
      tags: item.snippet.tags || [],
      viewCount: parseInt(item.statistics.viewCount) || 0,
      likeCount: parseInt(item.statistics.likeCount) || 0,
      commentCount: parseInt(item.statistics.commentCount) || 0,
    })) || [];

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube 검색 오류:', error);
    return NextResponse.json(
      { error: '동영상 검색에 실패했습니다.' },
      { status: 500 }
    );
  }
}
