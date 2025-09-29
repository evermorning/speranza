import { getServerSession } from 'next-auth';
import { Session } from 'next-auth';

/**
 * 권한 확인 유틸리티 함수들
 */

// 관리자 권한 확인
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'admin';
}

// 로그인 확인
export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user?.email;
}

// 관리자 또는 본인 확인 (프로필 수정 등에 사용)
export function isOwnerOrAdmin(session: Session | null, targetUserId?: string): boolean {
  if (!session?.user) return false;
  
  // 관리자는 모든 계정에 접근 가능
  if (isAdmin(session)) return true;
  
  // 본인 계정만 접근 가능
  return session.user.id === targetUserId;
}

// 권한 에러 생성
export function createUnauthorizedError(message: string = '권한이 없습니다') {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

export function createUnauthenticatedError(message: string = '로그인이 필요합니다') {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

// 관리자 권한 체크 미들웨어 (API 라우트용)
export async function requireAdmin(session: Session | null) {
  if (!session?.user?.email) {
    throw new Error('로그인이 필요합니다');
  }
  
  if (!isAdmin(session)) {
    throw new Error('관리자 권한이 필요합니다');
  }
  
  return session;
}

// 인증 체크 미들웨어 (API 라우트용)
export async function requireAuth(session: Session | null) {
  if (!session?.user?.email) {
    throw new Error('로그인이 필요합니다');
  }
  
  return session;
}
