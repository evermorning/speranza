import { createClient } from '@supabase/supabase-js';

// Supabase 프로젝트 설정
const supabaseUrl = 'https://skfruyopkifiuocrscrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZnJ1eW9wa2lmaXVvY3JzY3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzI2MDgsImV4cCI6MjA3Mzg0ODYwOH0.94rL_LsbNEy6gd9XCri2sAKt4gdHYEw_ab65usWwI5c';

// 서버 사이드 작업을 위한 서비스 역할 키 (실제 프로덕션에서는 환경변수로 관리)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Supabase 클라이언트 생성 (서버 사이드용)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 사용자 관련 타입 정의
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  provider?: string;
  image?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

// 사용자 관련 데이터베이스 함수들
export const userDb = {
  // 사용자 생성
  async create(user: {
    email: string;
    password: string;
    name: string;
    provider?: string;
    image?: string;
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: user.email,
        password: user.password,
        name: user.name,
        provider: user.provider || 'credentials',
        image: user.image || null
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 생성 실패: ${error.message}`);
    }

    return data;
  },

  // 이메일로 사용자 찾기
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116은 "not found" 오류
      throw new Error(`사용자 조회 실패: ${error.message}`);
    }

    // role이 없으면 동적으로 설정
    if (data && !data.role) {
      data.role = data.email === 'kwanwoo5@naver.com' ? 'admin' : 'user';
    }

    return data;
  },

  // ID로 사용자 찾기
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`사용자 조회 실패: ${error.message}`);
    }

    return data;
  },

  // 모든 사용자 조회 (관리자용)
  async findAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, provider, image, created_at, updated_at');

    if (error) {
      throw new Error(`사용자 목록 조회 실패: ${error.message}`);
    }

    // role이 없는 사용자들에게 동적으로 role 설정
    const usersWithRoles = (data || []).map(user => ({
      ...user,
      role: user.email === 'kwanwoo5@naver.com' ? 'admin' : 'user'
    }));

    return usersWithRoles as User[];
  },

  // 사용자 정보 업데이트
  async update(id: string, updates: {
    name?: string;
    email?: string;
    image?: string;
  }): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 정보 업데이트 실패: ${error.message}`);
    }

    return data;
  },

  // 비밀번호 업데이트
  async updatePassword(email: string, hashedPassword: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      throw new Error(`비밀번호 업데이트 실패: ${error.message}`);
    }

    return data;
  },

  // 사용자 삭제
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`사용자 삭제 실패: ${error.message}`);
    }
  }
};
