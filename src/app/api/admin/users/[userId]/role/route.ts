import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Database from 'better-sqlite3';
import path from 'path';
import { isAdmin, createUnauthorizedError, createUnauthenticatedError } from '@/lib/auth';

const db = new Database(path.join(process.cwd(), 'database.sqlite'));

// 사용자 역할 변경 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession();

    // 인증 확인
    if (!session?.user?.email) {
      return createUnauthenticatedError();
    }

    // 관리자 권한 확인
    if (!isAdmin(session)) {
      return createUnauthorizedError('관리자 권한이 필요합니다');
    }

    const { userId } = params;
    const { role } = await request.json();

    // 역할 유효성 검증
    if (!role || !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: '올바르지 않은 역할입니다' },
        { status: 400 }
      );
    }

    // 본인 계정 역할 변경 방지
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: '본인의 역할은 변경할 수 없습니다' },
        { status: 400 }
      );
    }

    // 대상 사용자 존재 확인
    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    
    if (!targetUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 마지막 관리자의 권한 제거 방지
    if ((targetUser as any).role === 'admin' && role === 'user') {
      const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
      
      if (adminCount.count <= 1) {
        return NextResponse.json(
          { error: '마지막 관리자의 권한은 제거할 수 없습니다' },
          { status: 400 }
        );
      }
    }

    // 역할 업데이트
    const result = db.prepare(`
      UPDATE users 
      SET role = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(role, userId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: '역할 변경에 실패했습니다' },
        { status: 500 }
      );
    }

    console.log(`Role updated: ${(targetUser as any).email} → ${role} by admin: ${session.user.email}`);

    return NextResponse.json(
      { 
        message: `사용자 역할이 ${role === 'admin' ? '관리자' : '일반 사용자'}로 변경되었습니다`,
        user: { 
          id: userId, 
          email: (targetUser as any).email,
          role: role 
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
