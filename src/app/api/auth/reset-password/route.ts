import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { userDb } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: '이메일과 새 비밀번호를 모두 입력해주세요' },
        { status: 400 }
      );
    }

    // 새 비밀번호 길이 검증
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '새 비밀번호는 최소 6자 이상이어야 합니다' },
        { status: 400 }
      );
    }

    // 사용자 확인
    const user = await userDb.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: '존재하지 않는 사용자입니다' },
        { status: 404 }
      );
    }

    // 새 비밀번호 해싱
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    const updatedUser = await userDb.updatePassword(email, hashedNewPassword);

    if (!updatedUser) {
      return NextResponse.json(
        { error: '비밀번호 변경에 실패했습니다' },
        { status: 500 }
      );
    }

    console.log(`Password updated successfully for user: ${email}`);

    return NextResponse.json(
      { message: '비밀번호가 성공적으로 변경되었습니다' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
