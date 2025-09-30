'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TossPaymentsUtils } from '@/lib/toss-payments';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (paymentKey && orderId && amount) {
      // 결제 승인 API 호출
      confirmPayment(paymentKey, orderId, parseInt(amount));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const confirmPayment = async (paymentKey: string, orderId: string, amount: number) => {
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPaymentData(result.data);
      } else {
        console.error('Payment confirmation failed:', result.error);
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">결제 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-white">결제가 완료되었습니다!</CardTitle>
            <CardDescription className="text-gray-300">
              결제가 성공적으로 처리되었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentData && (
              <div className="space-y-4">
                {/* 결제 정보 */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">결제 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">주문번호:</span>
                      <span className="text-white font-mono">{paymentData.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">주문명:</span>
                      <span className="text-white">{paymentData.orderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">결제금액:</span>
                      <span className="text-white font-semibold">
                        {TossPaymentsUtils.formatAmount(paymentData.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">결제수단:</span>
                      <span className="text-white">
                        {TossPaymentsUtils.getPaymentMethodName(paymentData.method)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">결제상태:</span>
                      <span className="text-green-400 font-semibold">
                        {paymentData.status === 'DONE' ? '결제완료' : paymentData.status}
                      </span>
                    </div>
                    {paymentData.approvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">승인일시:</span>
                        <span className="text-white">
                          {new Date(paymentData.approvedAt).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 카드 정보 */}
                {paymentData.card && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">카드 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">카드사:</span>
                        <span className="text-white">{paymentData.card.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">카드번호:</span>
                        <span className="text-white">{TossPaymentsUtils.maskCardNumber(paymentData.card.number)}</span>
                      </div>
                      {paymentData.card.installmentPlanMonths > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">할부:</span>
                          <span className="text-white">{paymentData.card.installmentPlanMonths}개월</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 가상계좌 정보 */}
                {paymentData.virtualAccount && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">가상계좌 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">계좌번호:</span>
                        <span className="text-white font-mono">{paymentData.virtualAccount.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">입금은행:</span>
                        <span className="text-white">{paymentData.virtualAccount.bankCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">입금기한:</span>
                        <span className="text-white">
                          {new Date(paymentData.virtualAccount.dueDate).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  홈으로 돌아가기
                </Button>
              </Link>
              
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                영수증 인쇄
              </Button>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-green-900 border border-green-700 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-2">결제 완료 안내</h4>
              <ul className="text-sm text-green-200 space-y-1">
                <li>• 결제가 성공적으로 완료되었습니다.</li>
                <li>• 결제 내역은 마이페이지에서 확인할 수 있습니다.</li>
                <li>• 문제가 있으시면 고객센터로 문의해주세요.</li>
                <li>• 감사합니다!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
