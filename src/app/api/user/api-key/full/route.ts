import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/supabase';

// GET: 사용자의 전체 API 키 조회 (로그인한 사용자만)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userEmail = url.searchParams.get('email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Supabase에서 사용자 조회
    const user = await userDb.findByEmail(userEmail);
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const apiKey = (user as any).youtube_api_key;

    if (!apiKey) {
      return NextResponse.json({
        hasApiKey: false,
        apiKey: null
      });
    }

    return NextResponse.json({
      hasApiKey: true,
      apiKey: apiKey // 전체 API 키 반환 (로그인한 사용자에게만)
    });

  } catch (error) {
    console.error('Full API key fetch error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
