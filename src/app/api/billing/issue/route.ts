import { NextRequest, NextResponse } from 'next/server';
import { TOSS_PAYMENTS_CONFIG, BillingKeyRequest, BillingKeyResponse } from '@/lib/toss-payments';
import { billingKeyDb } from '@/lib/payment-db';

// 빌링키 발급 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerKey,
      cardNumber,
      cardExpirationYear,
      cardExpirationMonth,
      customerIdentityNumber,
      cardPassword,
      customerName,
      customerEmail,
      customerMobilePhone,
      userId
    } = body;

    // 필수 필드 검증
    if (!customerKey || !cardNumber || !cardExpirationYear || !cardExpirationMonth || 
        !customerIdentityNumber || !cardPassword || !customerName || !userId) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 카드 번호 검증 (간단한 형식 검증)
    const cleanCardNumber = cardNumber.replace(/\D/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      return NextResponse.json(
        { error: '유효하지 않은 카드 번호입니다.' },
        { status: 400 }
      );
    }

    // 빌링키 발급 요청 데이터 구성
    const billingKeyRequest: BillingKeyRequest = {
      customerKey,
      cardNumber: cleanCardNumber,
      cardExpirationYear,
      cardExpirationMonth,
      customerIdentityNumber,
      cardPassword,
      customerName,
      customerEmail,
      customerMobilePhone,
    };

    // 토스페이먼츠 빌링키 발급 API 호출
    const tossResponse = await fetch(`${TOSS_PAYMENTS_CONFIG.baseUrl}/v1/billing/authorizations/card`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TOSS_PAYMENTS_CONFIG.secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(billingKeyRequest),
    });

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      console.error('TossPayments BillingKey Error:', errorData);
      return NextResponse.json(
        { error: '빌링키 발급에 실패했습니다.', details: errorData },
        { status: tossResponse.status }
      );
    }

    const billingKeyData: BillingKeyResponse = await tossResponse.json();

    // 빌링키 정보를 데이터베이스에 저장
    try {
      await billingKeyDb.create({
        user_id: userId,
        billing_key: billingKeyData.billingKey,
        customer_key: billingKeyData.customerKey,
        method: billingKeyData.method,
        card_info: billingKeyData.card ? {
          number: billingKeyData.card.number,
          company: billingKeyData.card.company,
          card_type: billingKeyData.card.cardType,
        } : undefined,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년 후 만료
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      return NextResponse.json(
        { error: '빌링키 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 빌링키 발급 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        billingKey: billingKeyData.billingKey,
        customerKey: billingKeyData.customerKey,
        status: billingKeyData.status,
        method: billingKeyData.method,
        card: billingKeyData.card ? {
          company: billingKeyData.card.company,
          number: billingKeyData.card.number,
          cardType: billingKeyData.card.cardType,
          ownerType: billingKeyData.card.ownerType,
        } : undefined,
        createdAt: billingKeyData.createdAt,
        updatedAt: billingKeyData.updatedAt,
      },
    });

  } catch (error) {
    console.error('Billing key issue error:', error);
    return NextResponse.json(
      { error: '빌링키 발급 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
