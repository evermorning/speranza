import { NextRequest, NextResponse } from 'next/server';
import { TOSS_PAYMENTS_CONFIG, TossPaymentResponse } from '@/lib/toss-payments';
import { paymentDb } from '@/lib/payment-db';

// 결제 승인 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    // 필수 필드 검증
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 토스페이먼츠 결제 승인 API 호출
    const confirmResponse = await fetch(`${TOSS_PAYMENTS_CONFIG.baseUrl}/v1/payments/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TOSS_PAYMENTS_CONFIG.secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    if (!confirmResponse.ok) {
      const errorData = await confirmResponse.json();
      console.error('TossPayments Confirm Error:', errorData);
      return NextResponse.json(
        { error: '결제 승인에 실패했습니다.', details: errorData },
        { status: confirmResponse.status }
      );
    }

    const confirmData: TossPaymentResponse = await confirmResponse.json();

    // 데이터베이스에서 결제 정보 조회 후 업데이트
    try {
      // 먼저 결제 정보가 있는지 확인
      const existingPayment = await paymentDb.findByOrderId(orderId);
      
      if (existingPayment) {
        // 기존 결제 정보 업데이트
        await paymentDb.updateStatus(
          paymentKey,
          confirmData.status,
          {
            approved_at: confirmData.approvedAt,
            receipt_url: confirmData.cashReceipt?.receiptUrl || confirmData.virtualAccount?.accountNumber || '',
          }
        );
      } else {
        // 결제 정보가 없으면 새로 생성 (임시)
        console.warn('Payment record not found, payment may not be saved to database');
      }
    } catch (dbError) {
      console.error('Database update error:', dbError);
      // 데이터베이스 업데이트 실패해도 결제 승인은 완료
    }

    // 결제 승인 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        paymentKey: confirmData.paymentKey,
        orderId: confirmData.orderId,
        orderName: confirmData.orderName,
        status: confirmData.status,
        approvedAt: confirmData.approvedAt,
        method: confirmData.method,
        card: confirmData.card,
        virtualAccount: confirmData.virtualAccount,
        transfer: confirmData.transfer,
        mobilePhone: confirmData.mobilePhone,
        giftCertificate: confirmData.giftCertificate,
        cashReceipt: confirmData.cashReceipt,
        totalAmount: confirmData.totalAmount,
        suppliedAmount: confirmData.suppliedAmount,
        vat: confirmData.vat,
        taxFreeAmount: confirmData.taxFreeAmount,
      },
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: '결제 승인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
