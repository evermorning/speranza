import { NextRequest, NextResponse } from 'next/server';
import { TOSS_PAYMENTS_CONFIG, TossPaymentsUtils } from '@/lib/toss-payments';
import { paymentDb } from '@/lib/payment-db';
import { userDb } from '@/lib/supabase';

// 단건결제 주문 생성 API (토스페이먼츠 위젯용)
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

    // 사용자 정보 조회
    const user = await userDb.findByEmail(userEmail);
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 고유 주문 ID 및 임시 결제 키 생성
    const orderId = TossPaymentsUtils.generateOrderId();
    const tempPaymentKey = `temp_${orderId}`; // 임시 결제 키 (나중에 실제 결제 키로 업데이트)

    // 데이터베이스에 주문 정보 미리 저장 (pending 상태)
    try {
      await paymentDb.create({
        user_id: user.id,
        payment_key: tempPaymentKey,
        order_id: orderId,
        order_name: orderName,
        amount: amount,
        currency: 'KRW',
        payment_method: 'card',
        status: 'pending',
        payment_type: 'one_time',
      });
      console.log('Order created in database:', orderId);
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // 데이터베이스 저장 실패해도 주문 생성은 진행 (나중에 결제 승인 시 재시도)
    }

    // 토스페이먼츠 위젯용 주문 정보 반환
    // 실제 결제는 클라이언트에서 토스페이먼츠 위젯을 통해 진행
    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderName,
        amount,
        customerEmail: customerEmail || userEmail,
        customerName,
        customerMobilePhone,
        successUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success`,
        failUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/fail`,
        clientKey: TOSS_PAYMENTS_CONFIG.clientKey,
        cardInstallmentPlan,
        useEscrow,
      },
    });

  } catch (error) {
    console.error('Payment order creation error:', error);
    return NextResponse.json(
      { error: '주문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
