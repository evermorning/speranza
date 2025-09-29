import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/supabase';

// GET: 사용자 API 키 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    
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

    return NextResponse.json({
      hasApiKey: !!apiKey,
      apiKey: apiKey ? `${apiKey.substring(0, 8)}****` : null // 보안을 위해 일부만 표시
    });

  } catch (error) {
    console.error('API key fetch error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST: 사용자 API 키 설정/업데이트
export async function POST(request: NextRequest) {
  try {
    const { apiKey, userEmail } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: 'API 키를 입력해주세요' },
        { status: 400 }
      );
    }

    // API 키 유효성 검증 (YouTube API 형식 체크)
    if (!apiKey.match(/^AIza[0-9A-Za-z-_]{35}$/)) {
      return NextResponse.json(
        { error: '올바른 YouTube API 키 형식이 아닙니다' },
        { status: 400 }
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

    // Supabase에서 API 키 업데이트
    const result = await userDb.update(user.id, { youtube_api_key: apiKey.trim() });

    if (!result) {
      return NextResponse.json(
        { error: 'API 키 업데이트에 실패했습니다' },
        { status: 500 }
      );
    }

    console.log(`API key updated for user: ${userEmail}`);

    return NextResponse.json({
      success: true,
      message: 'API 키가 성공적으로 저장되었습니다',
      apiKey: `${apiKey.substring(0, 8)}****` // 보안을 위해 일부만 반환
    });

  } catch (error) {
    console.error('API key update error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
