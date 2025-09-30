// 토스페이먼츠 API 클라이언트
// 서버 사이드에서 토스페이먼츠 API를 호출하기 위한 유틸리티

import type { TossPaymentResponse } from '@/types/payment';

const TOSS_API_BASE_URL = 'https://api.tosspayments.com/v1';
const SECRET_KEY = process.env.TOSS_SECRET_KEY || '';

/**
 * 토스페이먼츠 API 요청을 위한 기본 헤더
 */
function getHeaders() {
  const encodedKey = Buffer.from(`${SECRET_KEY}:`).toString('base64');
  return {
    'Authorization': `Basic ${encodedKey}`,
    'Content-Type': 'application/json',
  };
}

/**
 * 결제 승인
 * 결제창에서 결제를 완료한 후 최종적으로 결제를 승인합니다.
 * @param paymentKey - 토스페이먼츠 결제 키
 * @param orderId - 주문 ID
 * @param amount - 결제 금액
 */
export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_BASE_URL}/payments/confirm`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '결제 승인에 실패했습니다.');
  }

  return data;
}

/**
 * 결제 조회
 * paymentKey로 결제 정보를 조회합니다.
 * @param paymentKey - 토스페이먼츠 결제 키
 */
export async function getPayment(paymentKey: string): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_BASE_URL}/payments/${paymentKey}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '결제 조회에 실패했습니다.');
  }

  return data;
}

/**
 * orderId로 결제 조회
 * @param orderId - 주문 ID
 */
export async function getPaymentByOrderId(orderId: string): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_BASE_URL}/payments/orders/${orderId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '결제 조회에 실패했습니다.');
  }

  return data;
}

/**
 * 결제 취소
 * @param paymentKey - 토스페이먼츠 결제 키
 * @param cancelReason - 취소 사유
 * @param cancelAmount - 취소 금액 (부분 취소 시)
 * @param refundReceiveAccount - 환불 계좌 정보 (가상계좌 환불 시)
 */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number,
  refundReceiveAccount?: {
    bank: string;
    accountNumber: string;
    holderName: string;
  }
): Promise<TossPaymentResponse> {
  const body: any = {
    cancelReason,
  };

  // 부분 취소인 경우 금액 지정
  if (cancelAmount !== undefined) {
    body.cancelAmount = cancelAmount;
  }

  // 가상계좌 환불인 경우 계좌 정보 추가
  if (refundReceiveAccount) {
    body.refundReceiveAccount = refundReceiveAccount;
  }

  const response = await fetch(`${TOSS_API_BASE_URL}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '결제 취소에 실패했습니다.');
  }

  return data;
}

/**
 * 빌링키 발급 (카드 정보로)
 * 카드 정보를 직접 받아 빌링키를 발급합니다.
 * @param customerKey - 고객 고유 키
 * @param cardNumber - 카드 번호
 * @param cardExpirationYear - 카드 유효 연도 (YY)
 * @param cardExpirationMonth - 카드 유효 월 (MM)
 * @param customerIdentityNumber - 생년월일 6자리 (YYMMDD) 또는 사업자번호 10자리
 * @param cardPassword - 카드 비밀번호 앞 2자리 (선택)
 * @param customerName - 고객 이름 (선택)
 * @param customerEmail - 고객 이메일 (선택)
 */
export async function issueBillingKeyWithCard(
  customerKey: string,
  cardNumber: string,
  cardExpirationYear: string,
  cardExpirationMonth: string,
  customerIdentityNumber: string,
  cardPassword?: string,
  customerName?: string,
  customerEmail?: string
): Promise<any> {
  const body: any = {
    customerKey,
    cardNumber,
    cardExpirationYear,
    cardExpirationMonth,
    customerIdentityNumber,
  };

  if (cardPassword) body.cardPassword = cardPassword;
  if (customerName) body.customerName = customerName;
  if (customerEmail) body.customerEmail = customerEmail;

  const response = await fetch(`${TOSS_API_BASE_URL}/billing/authorizations/card`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '빌링키 발급에 실패했습니다.');
  }

  return data;
}

/**
 * 빌링키 발급 (authKey로)
 * 결제창에서 받은 authKey로 빌링키를 발급합니다.
 * @param customerKey - 고객 고유 키
 * @param authKey - 카드 인증 키
 */
export async function issueBillingKeyWithAuthKey(
  customerKey: string,
  authKey: string
): Promise<any> {
  const response = await fetch(`${TOSS_API_BASE_URL}/billing/authorizations/issue`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      customerKey,
      authKey,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '빌링키 발급에 실패했습니다.');
  }

  return data;
}

/**
 * 빌링키로 결제 요청
 * 발급받은 빌링키로 정기결제를 진행합니다.
 * @param billingKey - 빌링키
 * @param customerKey - 고객 고유 키
 * @param orderId - 주문 ID
 * @param orderName - 주문명
 * @param amount - 결제 금액
 * @param customerEmail - 고객 이메일
 * @param customerName - 고객 이름
 */
export async function requestBillingPayment(
  billingKey: string,
  customerKey: string,
  orderId: string,
  orderName: string,
  amount: number,
  customerEmail?: string,
  customerName?: string
): Promise<TossPaymentResponse> {
  const body: any = {
    customerKey,
    amount,
    orderId,
    orderName,
  };

  if (customerEmail) body.customerEmail = customerEmail;
  if (customerName) body.customerName = customerName;

  const response = await fetch(`${TOSS_API_BASE_URL}/billing/${billingKey}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '빌링 결제에 실패했습니다.');
  }

  return data;
}

/**
 * 빌링키 삭제
 * 발급받은 빌링키를 삭제합니다.
 * @param billingKey - 빌링키
 * @param customerKey - 고객 고유 키
 */
export async function deleteBillingKey(
  billingKey: string,
  customerKey: string
): Promise<void> {
  const response = await fetch(`${TOSS_API_BASE_URL}/billing/${billingKey}`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ customerKey }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || '빌링키 삭제에 실패했습니다.');
  }
}

/**
 * 가상계좌 조회
 * @param paymentKey - 토스페이먼츠 결제 키
 */
export async function getVirtualAccount(paymentKey: string): Promise<TossPaymentResponse> {
  return getPayment(paymentKey);
}

/**
 * 현금영수증 발급
 * @param paymentKey - 토스페이먼츠 결제 키
 * @param type - 현금영수증 타입 (소득공제, 지출증빙)
 * @param registrationNumber - 현금영수증 발급 번호 (휴대폰 번호, 사업자번호 등)
 */
export async function issueCashReceipt(
  paymentKey: string,
  type: '소득공제' | '지출증빙',
  registrationNumber: string
): Promise<any> {
  const response = await fetch(`${TOSS_API_BASE_URL}/payments/${paymentKey}/cash-receipts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      type,
      registrationNumber,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '현금영수증 발급에 실패했습니다.');
  }

  return data;
}

/**
 * 주문 ID 생성 유틸리티
 * 고유한 주문 ID를 생성합니다.
 * @param userId - 사용자 ID
 * @param prefix - 접두사 (기본값: 'ORDER')
 */
export function generateOrderId(userId: string, prefix = 'ORDER'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${userId}_${timestamp}_${random}`.toUpperCase();
}

/**
 * Customer Key 생성 유틸리티
 * 고객 고유 키를 생성합니다.
 * @param userId - 사용자 ID
 */
export function generateCustomerKey(userId: string): string {
  return `CUSTOMER_${userId}`;
}
