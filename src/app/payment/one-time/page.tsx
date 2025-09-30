'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TossPaymentsUtils, PaymentMethodConfig } from '@/lib/toss-payments';

export default function OneTimePaymentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    orderName: '',
    amount: '',
    customerName: '',
    customerEmail: '',
    customerMobilePhone: '',
    cardInstallmentPlan: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (!session?.user?.email) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 입력 검증
    if (!paymentData.orderName || !paymentData.amount || !paymentData.customerName) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    const amount = parseInt(paymentData.amount);
    if (isNaN(amount) || amount < 100 || amount > 10000000) {
      alert('결제 금액은 100원 이상 1천만원 이하여야 합니다.');
      return;
    }

    setLoading(true);

    try {
      // 주문 생성 API 호출
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderName: paymentData.orderName,
          amount: amount,
          customerEmail: paymentData.customerEmail || session.user.email,
          customerName: paymentData.customerName,
          customerMobilePhone: paymentData.customerMobilePhone,
          userEmail: session.user.email,
          cardInstallmentPlan: paymentData.cardInstallmentPlan,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '주문 생성에 실패했습니다.');
      }

      // 토스페이먼츠 결제 위젯 열기
      if (window.TossPayments) {
        const tossPayments = window.TossPayments(result.data.clientKey);
        
        tossPayments.requestPayment('카드', {
          amount: result.data.amount,
          orderId: result.data.orderId,
          orderName: result.data.orderName,
          customerName: result.data.customerName,
          customerEmail: result.data.customerEmail,
          customerMobilePhone: result.data.customerMobilePhone,
          successUrl: result.data.successUrl,
          failUrl: result.data.failUrl,
          cardInstallmentPlan: result.data.cardInstallmentPlan,
        }).catch((error: any) => {
          console.error('TossPayments widget error:', error);
          alert('결제 위젯 오류: ' + (error.message || '알 수 없는 오류'));
          setLoading(false);
        });
      } else {
        throw new Error('토스페이먼츠 SDK가 로드되지 않았습니다.');
      }

    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 토스페이먼츠 SDK 로드
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment-widget';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // SDK 로드 완료
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              💳 단건결제
            </CardTitle>
            <CardDescription className="text-gray-300">
              원하는 금액으로 한 번만 결제하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 주문 정보 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  주문명 *
                </label>
                <Input
                  name="orderName"
                  value={paymentData.orderName}
                  onChange={handleInputChange}
                  placeholder="예: Speranza 프리미엄 이용권"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  결제 금액 (원) *
                </label>
                <Input
                  name="amount"
                  type="number"
                  value={paymentData.amount}
                  onChange={handleInputChange}
                  placeholder="1000"
                  min="100"
                  max="10000000"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  100원 이상 1천만원 이하
                </p>
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
                  value={paymentData.customerName}
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
                  value={paymentData.customerEmail || session?.user?.email || ''}
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
                  value={paymentData.customerMobilePhone}
                  onChange={handleInputChange}
                  placeholder="010-1234-5678"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* 결제 수단 정보 */}
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">지원 결제 수단</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center text-blue-200">
                  <span className="mr-2">💳</span>
                  신용카드
                </div>
                <div className="flex items-center text-blue-200">
                  <span className="mr-2">🏦</span>
                  가상계좌
                </div>
                <div className="flex items-center text-blue-200">
                  <span className="mr-2">💰</span>
                  계좌이체
                </div>
                <div className="flex items-center text-blue-200">
                  <span className="mr-2">📱</span>
                  휴대폰
                </div>
              </div>
            </div>

            {/* 결제 버튼 */}
            <div className="space-y-3">
              <Button
                onClick={handlePayment}
                disabled={loading || !paymentData.orderName || !paymentData.amount || !paymentData.customerName}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                {loading ? '결제 준비 중...' : `${TossPaymentsUtils.formatAmount(parseInt(paymentData.amount) || 0)} 결제하기`}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                취소
              </Button>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-300 mb-2">결제 안내</h4>
              <ul className="text-sm text-yellow-200 space-y-1">
                <li>• 테스트 환경에서는 실제 결제가 발생하지 않습니다.</li>
                <li>• 결제 완료 후 성공/실패 페이지로 이동합니다.</li>
                <li>• 결제 정보는 안전하게 암호화되어 전송됩니다.</li>
                <li>• 문제가 발생하면 고객센터로 문의해주세요.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 토스페이먼츠 타입 선언
declare global {
  interface Window {
    TossPayments: any;
  }
}
