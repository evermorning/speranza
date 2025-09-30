import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Supabase 프로젝트 설정
const supabaseUrl = 'https://skfruyopkifiuocrscrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZnJ1eW9wa2lmaXVvY3JzY3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzI2MDgsImV4cCI6MjA3Mzg0ODYwOH0.94rL_LsbNEy6gd9XCri2sAKt4gdHYEw_ab65usWwI5c';

// 클라이언트 컴포넌트용 Supabase 클라이언트
export const createClientSupabase = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// 서버 컴포넌트용 Supabase 클라이언트
export const createServerSupabase = () => {
  const cookieStore = cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

// API 라우트용 Supabase 클라이언트
export const createApiSupabase = (request: NextRequest) => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      },
    },
  });
};

// 사용자 인증 관련 타입
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  subscription?: {
    isActive: boolean;
    plan?: string;
    expires_at?: string;
  };
}

// 인증 관련 함수들
export const authService = {
  // 현재 사용자 정보 가져오기 (클라이언트)
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const supabase = createClientSupabase();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // 사용자 추가 정보 조회 (users 테이블에서)
      const { data: userData } = await supabase
        .from('users')
        .select('name, image, role')
        .eq('id', user.id)
        .single();

      // 구독 정보 조회
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`
          status,
          expires_at,
          subscription_plans (name, display_name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      return {
        id: user.id,
        email: user.email!,
        name: userData?.name || user.user_metadata?.name,
        avatar_url: userData?.image || user.user_metadata?.avatar_url,
        role: userData?.role || (user.email === 'kwanwoo5@naver.com' ? 'admin' : 'user'),
        subscription: subscription ? {
          isActive: subscription.status === 'active',
          plan: subscription.subscription_plans?.name,
          expires_at: subscription.expires_at
        } : undefined
      };
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return null;
    }
  },

  // 현재 사용자 정보 가져오기 (서버)
  async getCurrentUserServer(): Promise<AuthUser | null> {
    try {
      const supabase = createServerSupabase();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // 사용자 추가 정보 조회
      const { data: userData } = await supabase
        .from('users')
        .select('name, image, role')
        .eq('id', user.id)
        .single();

      // 구독 정보 조회
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`
          status,
          expires_at,
          subscription_plans (name, display_name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      return {
        id: user.id,
        email: user.email!,
        name: userData?.name || user.user_metadata?.name,
        avatar_url: userData?.image || user.user_metadata?.avatar_url,
        role: userData?.role || (user.email === 'kwanwoo5@naver.com' ? 'admin' : 'user'),
        subscription: subscription ? {
          isActive: subscription.status === 'active',
          plan: subscription.subscription_plans?.name,
          expires_at: subscription.expires_at
        } : undefined
      };
    } catch (error) {
      console.error('서버 사용자 정보 조회 실패:', error);
      return null;
    }
  },

  // 이메일 회원가입
  async signUpWithEmail(email: string, password: string, name: string) {
    try {
      const supabase = createClientSupabase();
      
      // Supabase Auth로 사용자 생성
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // users 테이블에 추가 정보 저장
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name,
            provider: 'email'
          });

        if (insertError) {
          console.error('사용자 정보 저장 실패:', insertError);
        }

        // 기본 무료 플랜 구독 생성
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('name', 'free')
          .single();

        if (freePlan) {
          await supabase
            .from('user_subscriptions')
            .insert({
              user_id: data.user.id,
              plan_id: freePlan.id,
              status: 'active',
              expires_at: null // 무료 플랜은 만료일 없음
            });
        }

        // 기본 결제 정보 생성
        await supabase
          .from('user_payment_info')
          .insert({
            user_id: data.user.id,
            customer_key: `customer_${data.user.id}`
          });
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  },

  // 이메일 로그인
  async signInWithEmail(email: string, password: string) {
    try {
      const supabase = createClientSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },

  // 로그아웃
  async signOut() {
    try {
      const supabase = createClientSupabase();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  },

  // 비밀번호 재설정
  async resetPassword(email: string) {
    try {
      const supabase = createClientSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error);
      throw error;
    }
  },

  // 비밀번호 업데이트
  async updatePassword(newPassword: string) {
    try {
      const supabase = createClientSupabase();
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('비밀번호 업데이트 실패:', error);
      throw error;
    }
  },

  // 사용자 정보 업데이트
  async updateProfile(updates: {
    name?: string;
    avatar_url?: string;
  }) {
    try {
      const supabase = createClientSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // Supabase Auth 사용자 정보 업데이트
      const { error: authError } = await supabase.auth.updateUser({
        data: updates
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // users 테이블 정보 업데이트
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: updates.name,
          image: updates.avatar_url
        })
        .eq('id', user.id);

      if (dbError) {
        throw new Error(dbError.message);
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      throw error;
    }
  }
};

// 권한 확인 함수
export const hasPermission = (user: AuthUser | null, requiredRole: string): boolean => {
  if (!user) return false;
  
  // 관리자는 모든 권한
  if (user.role === 'admin') return true;
  
  // 요구되는 권한과 일치하는지 확인
  return user.role === requiredRole;
};

// 구독 권한 확인 함수
export const hasSubscriptionAccess = (user: AuthUser | null, requiredPlan?: string): boolean => {
  if (!user) return false;
  
  // 관리자는 모든 기능 접근 가능
  if (user.role === 'admin') return true;
  
  // 구독이 활성화되어 있는지 확인
  if (!user.subscription?.isActive) return false;
  
  // 특정 플랜이 요구되는 경우
  if (requiredPlan) {
    return user.subscription.plan === requiredPlan;
  }
  
  return true;
};

// 미들웨어용 인증 확인
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const supabase = createApiSupabase(request);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // 사용자 추가 정보 조회
    const { data: userData } = await supabase
      .from('users')
      .select('name, image, role')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      name: userData?.name || user.user_metadata?.name,
      avatar_url: userData?.image || user.user_metadata?.avatar_url,
      role: userData?.role || (user.email === 'kwanwoo5@naver.com' ? 'admin' : 'user')
    };
  } catch (error) {
    console.error('인증 확인 실패:', error);
    return null;
  }
}
