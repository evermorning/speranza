import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const regionCode = searchParams.get('regionCode') || 'KR';
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const categoryId = searchParams.get('categoryId');

    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });
    }

    // YouTube Data API v3 직접 호출
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxResults}&key=${apiKey}`;
    
    if (categoryId && categoryId !== 'all') {
      url += `&videoCategoryId=${categoryId}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'YouTube API 요청에 실패했습니다.');
    }

    const data = await response.json();
    const videos = data.items?.map((video: any) => ({
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

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube API 오류:', error);
    return NextResponse.json(
      { error: '트렌딩 비디오를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
