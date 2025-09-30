import { NextRequest, NextResponse } from 'next/server';
import { TOSS_PAYMENTS_CONFIG, SubscriptionPaymentRequest, TossPaymentResponse } from '@/lib/toss-payments';
import { paymentDb, billingKeyDb } from '@/lib/payment-db';

// 정기결제 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      billingKey,
      customerKey,
      orderName,
      amount,
      customerEmail,
      customerName,
      customerMobilePhone,
      userId,
      subscriptionId
    } = body;

    // 필수 필드 검증
    if (!billingKey || !customerKey || !orderName || !amount || !userId) {
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

    // 빌링키 유효성 검증
    try {
      const billingKeyInfo = await billingKeyDb.findByBillingKey(billingKey);
      if (!billingKeyInfo || billingKeyInfo.status !== 'active') {
        return NextResponse.json(
          { error: '유효하지 않은 빌링키입니다.' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Billing key validation error:', error);
      return NextResponse.json(
        { error: '빌링키 검증에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 고유 주문 ID 생성
    const orderId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // 정기결제 요청 데이터 구성
    const subscriptionPaymentRequest: SubscriptionPaymentRequest = {
      billingKey,
      customerKey,
      orderId,
      orderName,
      amount,
      customerEmail,
      customerName,
      customerMobilePhone,
      taxFreeAmount: 0,
      taxExemptionAmount: 0,
    };

    // 토스페이먼츠 정기결제 API 호출
    const tossResponse = await fetch(`${TOSS_PAYMENTS_CONFIG.baseUrl}/v1/billing/${billingKey}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TOSS_PAYMENTS_CONFIG.secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        orderName,
        amount,
        customerEmail,
        customerName,
        customerMobilePhone,
        taxFreeAmount: 0,
        taxExemptionAmount: 0,
      }),
    });

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      console.error('TossPayments Subscription Payment Error:', errorData);
      return NextResponse.json(
        { error: '정기결제에 실패했습니다.', details: errorData },
        { status: tossResponse.status }
      );
    }

    const paymentData: TossPaymentResponse = await tossResponse.json();

    // 결제 정보를 데이터베이스에 저장
    try {
      await paymentDb.create({
        user_id: userId,
        subscription_id: subscriptionId,
        payment_key: paymentData.paymentKey,
        order_id: paymentData.orderId,
        order_name: paymentData.orderName,
        amount: paymentData.totalAmount,
        currency: 'KRW',
        payment_method: paymentData.method,
        status: paymentData.status,
        payment_type: 'subscription',
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // 데이터베이스 저장 실패해도 결제는 진행
    }

    // 정기결제 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        paymentKey: paymentData.paymentKey,
        orderId: paymentData.orderId,
        orderName: paymentData.orderName,
        status: paymentData.status,
        approvedAt: paymentData.approvedAt,
        method: paymentData.method,
        card: paymentData.card,
        totalAmount: paymentData.totalAmount,
        suppliedAmount: paymentData.suppliedAmount,
        vat: paymentData.vat,
        taxFreeAmount: paymentData.taxFreeAmount,
      },
    });

  } catch (error) {
    console.error('Subscription payment error:', error);
    return NextResponse.json(
      { error: '정기결제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
