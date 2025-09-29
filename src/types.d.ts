import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string;
      role?: 'admin' | 'user';
    }
  }
}

// users.ts에서 사용할 User 타입 정의
export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  provider?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
  role?: 'admin' | 'user'; // 역할 추가: 관리자 또는 일반 사용자
}

export interface AdminUser extends User {
  role: 'admin';
}

export interface RegularUser extends User {
  role: 'user';
}