'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, AdminUser } from '@/types';
import { Crown, Users, Shield, Settings, Trash2, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';

interface UserWithStats extends User {
  hasApiKey: boolean;
  lastLogin?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    usersWithApiKeys: 0,
  });

  // 관리자 권한 확인 (디버깅용 임시 완화)
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }
    
    console.log('Admin page - session info:', {
      user: session.user,
      role: session.user?.role,
      email: session.user?.email
    });
    
    // 관리자 권한 확인 (kwanwoo5@naver.com은 임시 허용)
    if (session.user.email === 'kwanwoo5@naver.com') {
      console.log('Allowing access for kwanwoo5@naver.com (admin email)');
      return;
    }
    
    if (session.user.role !== 'admin') {
      console.log('Access denied - not admin role:', session.user.role);
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // 사용자 목록 조회
  useEffect(() => {
    const fetchUsers = async () => {
      console.log('Admin page fetchUsers called with session:', {
        email: session?.user?.email,
        role: session?.user?.role,
        status: status
      });
      
      // 임시로 kwanwoo5@naver.com는 항상 허용
      if (session?.user?.role !== 'admin' && session?.user?.email !== 'kwanwoo5@naver.com') {
        console.log('Access denied in fetchUsers');
        return;
      }
      
      try {
        console.log('Calling /api/admin/users...');
        const response = await fetch('/api/admin/users');
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Failed to fetch users: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        setUsers(data.users);
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        alert('사용자 목록 조회에 실패했습니다: ' + error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin' || session?.user?.email === 'kwanwoo5@naver.com') {
      console.log('Calling fetchUsers...');
      fetchUsers();
    } else {
      console.log('No admin access, not calling fetchUsers');
    }
  }, [session]);

  // 사용자 역할 변경
  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');

      // 사용자 목록 갱신
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      alert(`사용자 권한이 ${newRole === 'admin' ? '관리자' : '일반 사용자'}로 변경되었습니다.`);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('권한 변경에 실패했습니다.');
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`정말로 ${userEmail} 계정을 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      // 사용자 목록에서 제거
      setUsers(users.filter(user => user.id !== userId));
      alert('사용자가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('사용자 삭제에 실패했습니다.');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  // 관리자 권한 체크 (kwanwoo5@naver.com은 임시 허용)
  if (session?.user?.role !== 'admin' && session?.user?.email !== 'kwanwoo5@naver.com') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">접근 권한이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold">관리자 대시보드</h1>
                <p className="text-gray-400 text-sm">Speranza 시스템 관리</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {session?.user?.name || 'Unknown'} ({session?.user?.email || 'Unknown'})
              </span>
              <Link href="/">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  홈으로
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">전체 사용자</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <p className="text-xs text-gray-400">등록된 사용자 수</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">관리자</CardTitle>
              <Crown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.adminCount}</div>
              <p className="text-xs text-gray-400">관리자 권한 사용자</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">API 키 사용자</CardTitle>
              <Settings className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.usersWithApiKeys}</div>
              <p className="text-xs text-gray-400">YouTube API 키 설정 완료</p>
            </CardContent>
          </Card>
        </div>

        {/* 사용자 관리 테이블 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <span>사용자 관리</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">사용자</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">역할</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">API 키</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">가입일</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-300">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' 
                            : 'bg-blue-900 text-blue-300 border border-blue-700'
                        }`}>
                          {user.role === 'admin' ? (
                            <>
                              <Crown className="w-3 h-3 mr-1" />
                              관리자
                            </>
                          ) : (
                            <>
                              <Users className="w-3 h-3 mr-1" />
                              사용자
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.hasApiKey ? (
                          <span className="inline-flex items-center text-green-400 text-sm">
                            <UserCheck className="w-4 h-4 mr-1" />
                            설정됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-500 text-sm">
                            <UserX className="w-4 h-4 mr-1" />
                            미설정
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {user.role === 'admin' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(user.id, 'user')}
                              className="border-yellow-600 text-yellow-300 hover:bg-yellow-900"
                            >
                              일반으로 변경
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(user.id, 'admin')}
                              className="border-blue-600 text-blue-300 hover:bg-blue-900"
                            >
                              관리자로 변경
                            </Button>
                          )}
                          
                          {/* 본인 계정 삭제 방지 */}
                          {user.email !== session.user.email && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="border-red-600 text-red-400 hover:bg-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
