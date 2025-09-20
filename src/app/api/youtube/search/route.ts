import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

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

    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });

    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: 'video',
      order: 'relevance',
      maxResults,
    });

    const videos = response.data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
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
