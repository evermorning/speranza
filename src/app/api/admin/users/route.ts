import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Database from 'better-sqlite3';
import path from 'path';
// import { isAdmin, createUnauthorizedError, createUnauthenticatedError } from '@/lib/auth';

const db = new Database(path.join(process.cwd(), 'database.sqlite'));

// 모든 사용자 조회 (관리자 전용)
export async function GET(request: NextRequest) {
  try {
    console.log('Admin users API called');
    
    const session = await getServerSession();

    // 인증 확인
    if (!session?.user?.email) {
      return createUnauthenticatedError();
    }

    // 관리자 권한 확인 (kwanwoo5@naver.com은 임시 허용)
    if (!isAdmin(session) && session.user.email !== 'kwanwoo5@naver.com') {
      return createUnauthorizedError('관리자 권한이 필요합니다');
    }

    // 모든 사용자 조회
    const users = db.prepare(`
      SELECT 
        id, email, name, role, provider, created_at, updated_at,
        CASE WHEN youtube_api_key IS NOT NULL AND youtube_api_key != '' THEN 1 ELSE 0 END as hasApiKey
      FROM users 
      ORDER BY 
        CASE WHEN role = 'admin' THEN 0 ELSE 1 END,
        created_at DESC
    `).all();

    // 통계 정보 계산
    const stats = {
      totalUsers: users.length,
      adminCount: users.filter((user: any) => user.role === 'admin').length,
      usersWithApiKeys: users.filter((user: any) => user.hasApiKey).length,
    };

    return NextResponse.json(
      { users, stats },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: '사용자 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
