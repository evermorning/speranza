import { NextRequest, NextResponse } from 'next/server';
import { TOSS_PAYMENTS_CONFIG, SubscriptionPaymentRequest, TossPaymentResponse } from '@/lib/toss-payments';
import { paymentDb, billingKeyDb, planDb, subscriptionDb } from '@/lib/payment-db';
import { userDb } from '@/lib/supabase';

// 정기결제 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { 
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

    // 보조 채움 로직: email만 넘어온 경우 서버에서 userId/billingKey/customerKey 자동 조회
    if ((!billingKey || !customerKey || !userId) && customerEmail) {
      try {
        const user = await userDb.findByEmail(customerEmail);
        if (user?.id) {
          userId = user.id;
          // 사용자 최신 활성 빌링키 조회 (활성 + 최신 생성일 우선)
          const latest = await billingKeyDb.findLatestActiveByUserId
            ? await billingKeyDb.findLatestActiveByUserId(user.id)
            : null;
          if (latest) {
            billingKey = billingKey || latest.billing_key || latest.billingKey;
            customerKey = customerKey || latest.customer_key || latest.customerKey;
          }
        }
      } catch (e) {
        // 무시하고 아래 필수값 검증에서 처리
      }
    }

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
      // 결제 전 사용자 구독이 없으면 기본 플랜으로 생성
      // 기본 플랜은 'basic'이 존재한다고 가정 (마이그레이션에서 생성)
      try {
        const existingSub = await subscriptionDb.findByUserId(userId);
        if (!existingSub) {
          const basicPlan = await planDb.findByName('basic');
          if (!basicPlan) {
            return NextResponse.json(
              { error: '기본 플랜을 찾을 수 없습니다. 관리자에게 문의하세요.' },
              { status: 500 }
            );
          }
          await subscriptionDb.create({
            user_id: userId,
            plan_id: basicPlan.id,
            billing_key_id: billingKeyInfo.id,
          });
        }
      } catch (subError) {
        console.error('Subscription ensure error:', subError);
        // 구독 생성 실패해도 결제는 시도 가능
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
        customerKey,
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
      // 최신 활성 구독 조회 (방금 생성되었을 수 있음)
      const activeSub = await subscriptionDb.findByUserId(userId);
      await paymentDb.create({
        user_id: userId,
        subscription_id: activeSub?.id || subscriptionId,
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
