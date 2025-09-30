import { NextRequest, NextResponse } from 'next/server';
import { TOSS_PAYMENTS_CONFIG, TossPaymentResponse, PaymentRequest } from '@/lib/toss-payments';
import { paymentDb } from '@/lib/payment-db';

// 단건결제 생성 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      orderName, 
      amount, 
      customerEmail, 
      customerName,
      customerMobilePhone,
      userEmail,
      cardInstallmentPlan = 0,
      useEscrow = false 
    } = body;

    // 필수 필드 검증
    if (!orderName || !amount || !userEmail) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 금액 검증
    if (amount < 100 || amount > 10000000) {
      return NextResponse.json(
        { error: '결제 금액은 100원 이상 1천만원 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // 고유 주문 ID 생성
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // 결제 요청 데이터 구성
    const paymentRequest: PaymentRequest = {
      orderId,
      orderName,
      amount,
      customerEmail,
      customerName,
      customerMobilePhone,
      successUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success`,
      failUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/fail`,
      cardInstallmentPlan,
      useEscrow,
      taxFreeAmount: 0,
      taxExemptionAmount: 0,
    };

    // 토스페이먼츠 결제 승인 API 호출
    const tossResponse = await fetch(`${TOSS_PAYMENTS_CONFIG.baseUrl}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TOSS_PAYMENTS_CONFIG.secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    });

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      console.error('TossPayments API Error:', errorData);
      return NextResponse.json(
        { error: '결제 요청에 실패했습니다.', details: errorData },
        { status: tossResponse.status }
      );
    }

    const tossPaymentData: TossPaymentResponse = await tossResponse.json();

    // 결제 정보를 데이터베이스에 저장
    try {
      await paymentDb.create({
        user_id: userEmail, // 임시로 이메일 사용 (실제로는 user_id 사용)
        payment_key: tossPaymentData.paymentKey,
        order_id: tossPaymentData.orderId,
        order_name: tossPaymentData.orderName,
        amount: tossPaymentData.totalAmount,
        currency: 'KRW',
        payment_method: tossPaymentData.method,
        status: tossPaymentData.status,
        payment_type: 'one_time',
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // 데이터베이스 저장 실패해도 결제는 진행
    }

    // 클라이언트로 결제 정보 반환
    return NextResponse.json({
      success: true,
      data: {
        paymentKey: tossPaymentData.paymentKey,
        orderId: tossPaymentData.orderId,
        orderName: tossPaymentData.orderName,
        amount: tossPaymentData.totalAmount,
        status: tossPaymentData.status,
        successUrl: paymentRequest.successUrl,
        failUrl: paymentRequest.failUrl,
      },
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: '결제 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
