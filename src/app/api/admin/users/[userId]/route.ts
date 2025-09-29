import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Database from 'better-sqlite3';
import path from 'path';
import { isAdmin, createUnauthorizedError, createUnauthenticatedError } from '@/lib/auth';

const db = new Database(path.join(process.cwd(), 'database.sqlite'));

// 사용자 삭제 (관리자 전용)
export async function DELETE(
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

    // 본인 계정 삭제 방지
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: '본인 계정은 삭제할 수 없습니다' },
        { status: 400 }
      );
    }

    // 삭제할 사용자 존재 확인
    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    
    if (!targetUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 마지막 관리자 삭제 방지
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    
    if ((targetUser as any).role === 'admin' && adminCount.count <= 1) {
      return NextResponse.json(
        { error: '마지막 관리자는 삭제할 수 없습니다' },
        { status: 400 }
      );
    }

    // 사용자 삭제
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: '사용자 삭제에 실패했습니다' },
        { status: 500 }
      );
    }

    console.log(`User deleted: ${(targetUser as any).email} by admin: ${session.user.email}`);

    return NextResponse.json(
      { message: '사용자가 성공적으로 삭제되었습니다' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
