'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TossPaymentsUtils } from '@/lib/toss-payments';

export default function BillingRegisterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardExpirationYear: '',
    cardExpirationMonth: '',
    customerIdentityNumber: '',
    cardPassword: '',
    customerName: '',
    customerEmail: '',
    customerMobilePhone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBillingKeyRegister = async () => {
    if (!session?.user?.email) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 입력 검증
    const requiredFields = ['cardNumber', 'cardExpirationYear', 'cardExpirationMonth', 'customerIdentityNumber', 'cardPassword', 'customerName'];
    for (const field of requiredFields) {
      if (!cardData[field as keyof typeof cardData]) {
        alert('필수 정보를 모두 입력해주세요.');
        return;
      }
    }

    setLoading(true);

    try {
      // 빌링키 발급 API 호출
      const response = await fetch('/api/billing/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerKey: TossPaymentsUtils.generateCustomerKey(session.user.email),
          cardNumber: cardData.cardNumber,
          cardExpirationYear: cardData.cardExpirationYear,
          cardExpirationMonth: cardData.cardExpirationMonth,
          customerIdentityNumber: cardData.customerIdentityNumber,
          cardPassword: cardData.cardPassword,
          customerName: cardData.customerName,
          customerEmail: cardData.customerEmail || session.user.email,
          customerMobilePhone: cardData.customerMobilePhone,
          userId: session.user.email, // 임시로 이메일 사용
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '빌링키 발급에 실패했습니다.');
      }

      alert('빌링키가 성공적으로 등록되었습니다!');
      router.push('/');

    } catch (error) {
      console.error('Billing key registration error:', error);
      alert(error instanceof Error ? error.message : '빌링키 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              💳 정기결제 카드 등록
            </CardTitle>
            <CardDescription className="text-gray-300">
              정기결제를 위해 카드 정보를 등록하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 카드 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">카드 정보</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  카드번호 *
                </label>
                <Input
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234-5678-9012-3456"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    만료년도 (YY) *
                  </label>
                  <Input
                    name="cardExpirationYear"
                    value={cardData.cardExpirationYear}
                    onChange={handleInputChange}
                    placeholder="25"
                    maxLength={2}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    예: 2025년 → 25
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    만료월 (MM) *
                  </label>
                  <Input
                    name="cardExpirationMonth"
                    value={cardData.cardExpirationMonth}
                    onChange={handleInputChange}
                    placeholder="12"
                    maxLength={2}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    예: 12월 → 12, 3월 → 03
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  주민등록번호 앞자리 *
                </label>
                <Input
                  name="customerIdentityNumber"
                  value={cardData.customerIdentityNumber}
                  onChange={handleInputChange}
                  placeholder="901201"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  카드 비밀번호 앞 2자리 *
                </label>
                <Input
                  name="cardPassword"
                  type="password"
                  value={cardData.cardPassword}
                  onChange={handleInputChange}
                  placeholder="12"
                  maxLength={2}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* 고객 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">고객 정보</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  고객명 *
                </label>
                <Input
                  name="customerName"
                  value={cardData.customerName}
                  onChange={handleInputChange}
                  placeholder="홍길동"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일
                </label>
                <Input
                  name="customerEmail"
                  type="email"
                  value={cardData.customerEmail || session?.user?.email || ''}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  휴대폰 번호
                </label>
                <Input
                  name="customerMobilePhone"
                  value={cardData.customerMobilePhone}
                  onChange={handleInputChange}
                  placeholder="010-1234-5678"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* 등록 버튼 */}
            <div className="space-y-3">
              <Button
                onClick={handleBillingKeyRegister}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
              >
                {loading ? '등록 중...' : '빌링키 등록하기'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                취소
              </Button>
            </div>

            {/* 테스트 카드 정보 */}
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-300 mb-2">💳 테스트 카드 정보</h4>
              <ul className="text-sm text-yellow-200 space-y-1 font-mono">
                <li>• 카드번호: 4242-4242-4242-4242</li>
                <li>• 만료년도: 25 (2025년)</li>
                <li>• 만료월: 12</li>
                <li>• 주민등록번호: 901201</li>
                <li>• 카드 비밀번호: 12</li>
              </ul>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">정기결제 안내</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• 등록된 카드로 자동 결제됩니다.</li>
                <li>• 카드 정보는 안전하게 암호화되어 저장됩니다.</li>
                <li>• 연도는 2자리 (25), 월은 2자리 (01~12)로 입력하세요.</li>
                <li>• 언제든지 등록된 카드를 변경할 수 있습니다.</li>
                <li>• 정기결제를 해지하려면 마이페이지에서 해지하세요.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
