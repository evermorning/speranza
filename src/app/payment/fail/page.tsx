'use client';

import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-white">결제에 실패했습니다</CardTitle>
            <CardDescription className="text-gray-300">
              결제 처리 중 문제가 발생했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 오류 정보 */}
            <div className="bg-red-900 border border-red-700 rounded-lg p-4">
              <h3 className="font-semibold text-red-300 mb-3">오류 정보</h3>
              <div className="space-y-2 text-sm">
                {errorCode && (
                  <div className="flex justify-between">
                    <span className="text-red-200">오류 코드:</span>
                    <span className="text-red-100 font-mono">{errorCode}</span>
                  </div>
                )}
                {errorMessage && (
                  <div className="flex justify-between">
                    <span className="text-red-200">오류 메시지:</span>
                    <span className="text-red-100">{errorMessage}</span>
                  </div>
                )}
                {orderId && (
                  <div className="flex justify-between">
                    <span className="text-red-200">주문번호:</span>
                    <span className="text-red-100 font-mono">{orderId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-3">
              <Link href="/payment/one-time" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  다시 결제하기
                </Button>
              </Link>
              
              <Link href="/" className="block">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-300 mb-2">결제 실패 안내</h4>
              <ul className="text-sm text-yellow-200 space-y-1">
                <li>• 카드 정보를 확인해주세요.</li>
                <li>• 잔액이 충분한지 확인해주세요.</li>
                <li>• 문제가 지속되면 고객센터로 문의해주세요.</li>
                <li>• 다른 결제 수단을 이용해보세요.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">오류 정보를 불러오는 중...</p>
        </div>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}
