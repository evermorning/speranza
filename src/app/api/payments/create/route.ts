import { NextRequest, NextResponse } from 'next/server';
import { TOSS_PAYMENTS_CONFIG, TossPaymentsUtils } from '@/lib/toss-payments';

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

    // 고유 주문 ID 생성
    const orderId = TossPaymentsUtils.generateOrderId();

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
