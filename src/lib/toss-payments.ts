// 토스페이먼츠 설정 및 유틸리티 함수

// 토스페이먼츠 API 키 설정
export const TOSS_PAYMENTS_CONFIG = {
  clientKey: 'test_ck_Gv6LjeKD8aj04PvMoOeL3wYxAdXy',
  secretKey: 'test_sk_DnyRpQWGrN9pM6nOWl50VKwv1M9E',
  baseUrl: 'https://api.tosspayments.com',
  isTest: true, // 테스트 모드
};

// 결제 요청 타입
export interface PaymentRequest {
  orderId: string;
  orderName: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
  customerMobilePhone?: string;
  successUrl: string;
  failUrl: string;
  cardInstallmentPlan?: number;
  useEscrow?: boolean;
  taxFreeAmount?: number;
  taxExemptionAmount?: number;
}

// 빌링키 발급 요청 타입
export interface BillingKeyRequest {
  customerKey: string;
  cardNumber: string;
  cardExpirationYear: string;
  cardExpirationMonth: string;
  customerIdentityNumber: string;
  cardPassword: string;
  customerName: string;
  customerEmail?: string;
  customerMobilePhone?: string;
}

// 정기결제 요청 타입
export interface SubscriptionPaymentRequest {
  billingKey: string;
  customerKey: string;
  orderId: string;
  orderName: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
  customerMobilePhone?: string;
  taxFreeAmount?: number;
  taxExemptionAmount?: number;
}

// 토스페이먼츠 API 응답 타입
export interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  requestedAt: string;
  approvedAt?: string;
  card?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
    useCardPoint: boolean;
    useDiscount: boolean;
    useEasyPay: boolean;
    useBonus: boolean;
  };
  virtualAccount?: {
    accountType: string;
    accountNumber: string;
    bankCode: string;
    customerName: string;
    dueDate: string;
    refundStatus: string;
    expired: boolean;
    settlementStatus: string;
  };
  transfer?: {
    bankCode: string;
    settlementStatus: string;
  };
  mobilePhone?: {
    customerMobilePhone: string;
    settlementStatus: string;
    receiptUrl: string;
  };
  giftCertificate?: {
    approveNo: string;
    settlementStatus: string;
  };
  cashReceipt?: {
    receiptKey: string;
    orderId: string;
    orderName: string;
    type: string;
    issueNumber: string;
    receiptUrl: string;
    businessNumber: string;
    transactionType: string;
    tradeType: string;
    taxFreeAmount: number;
    supplyAmount: number;
    vatAmount: number;
    serviceAmount: number;
    totalAmount: number;
    cultureExpense: boolean;
    amount: number;
  };
  cancels?: Array<{
    cancelId: string;
    cancelAmount: number;
    cancelReason: string;
    taxFreeAmount: number;
    taxExemptionAmount: number;
    refundableAmount: number;
    easyPayDiscountAmount: number;
    canceledAt: string;
    transactionKey: string;
    receiptKey: string;
  }>;
  secret?: string;
  type?: string;
  easyPay?: {
    provider: string;
    amount: number;
    discountAmount: number;
  };
  country: string;
  failure?: {
    code: string;
    message: string;
  };
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  taxFreeAmount: number;
  method: string;
  version: string;
}

// 빌링키 응답 타입
export interface BillingKeyResponse {
  billingKey: string;
  customerKey: string;
  status: string;
  method: string;
  card?: {
    company: string;
    number: string;
    cardType: string;
    ownerType: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 유틸리티 함수들
export const TossPaymentsUtils = {
  // 고유 주문 ID 생성
  generateOrderId: (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `order_${timestamp}_${random}`;
  },

  // 고유 빌링키 ID 생성
  generateBillingKeyId: (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `billing_${timestamp}_${random}`;
  },

  // 고유 고객 키 생성
  generateCustomerKey: (userId: string): string => {
    return `customer_${userId}`;
  },

  // 결제 상태 확인
  isPaymentSuccess: (status: string): boolean => {
    return status === 'DONE';
  },

  // 결제 실패 여부 확인
  isPaymentFailed: (status: string): boolean => {
    return ['CANCELED', 'PARTIAL_CANCELED', 'ABORTED', 'EXPIRED'].includes(status);
  },

  // 빌링키 상태 확인
  isBillingKeyActive: (status: string): boolean => {
    return status === 'ISSUED';
  },

  // 카드 번호 마스킹
  maskCardNumber: (cardNumber: string): string => {
    if (cardNumber.length < 8) return cardNumber;
    return cardNumber.substring(0, 4) + '****' + cardNumber.substring(cardNumber.length - 4);
  },

  // 금액 포맷팅 (원 단위)
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  },

  // 결제 수단 한글 변환
  getPaymentMethodName: (method: string): string => {
    const methodMap: { [key: string]: string } = {
      '카드': '신용카드',
      '가상계좌': '가상계좌',
      '계좌이체': '계좌이체',
      '휴대폰': '휴대폰 결제',
      '문화상품권': '문화상품권',
      '도서문화상품권': '도서문화상품권',
      '게임문화상품권': '게임문화상품권',
    };
    return methodMap[method] || method;
  },
};

// 에러 메시지 매핑
export const TossPaymentsErrorMessages: { [key: string]: string } = {
  'INVALID_CARD_COMPANY': '지원하지 않는 카드사입니다.',
  'INVALID_CARD_NUMBER': '유효하지 않은 카드 번호입니다.',
  'INVALID_CARD_EXPIRY': '유효하지 않은 카드 유효기간입니다.',
  'INVALID_CARD_PASSWORD': '유효하지 않은 카드 비밀번호입니다.',
  'INVALID_CUSTOMER_IDENTITY_NUMBER': '유효하지 않은 주민등록번호입니다.',
  'CARD_QUOTA_EXCEEDED': '카드 한도가 초과되었습니다.',
  'INSUFFICIENT_FUNDS': '잔액이 부족합니다.',
  'PAYMENT_BLOCKED': '결제가 차단되었습니다.',
  'PAYMENT_TIMEOUT': '결제 시간이 초과되었습니다.',
  'UNKNOWN_ERROR': '알 수 없는 오류가 발생했습니다.',
};

// 결제 수단별 설정
export const PaymentMethodConfig = {
  card: {
    name: '신용카드',
    icon: '💳',
    description: '안전하고 빠른 카드 결제',
  },
  virtualAccount: {
    name: '가상계좌',
    icon: '🏦',
    description: '입금 후 자동 결제 완료',
  },
  transfer: {
    name: '계좌이체',
    icon: '💰',
    description: '실시간 계좌이체',
  },
  mobile: {
    name: '휴대폰',
    icon: '📱',
    description: '휴대폰 요금으로 결제',
  },
  giftCertificate: {
    name: '상품권',
    icon: '🎁',
    description: '문화상품권 등 상품권 결제',
  },
};