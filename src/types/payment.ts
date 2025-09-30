// 토스페이먼츠 연동을 위한 타입 정의

// 구독 플랜 타입
export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  features: {
    limits: {
      daily_searches: number;
      trend_reports: number;
    };
    features: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 사용자 구독 타입
export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  billing_key_id?: string;
  started_at: string;
  expires_at?: string;
  cancelled_at?: string;
  next_billing_date?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

// 결제 타입
export interface Payment {
  id: string;
  user_id: string;
  subscription_id?: string;
  payment_key: string;
  order_id: string;
  order_name: string;
  amount: number;
  currency: string;
  payment_method?: string;
  status: 'READY' | 'IN_PROGRESS' | 'WAITING_FOR_DEPOSIT' | 'DONE' | 'CANCELED' | 'PARTIAL_CANCELED' | 'ABORTED' | 'EXPIRED';
  approved_at?: string;
  canceled_at?: string;
  failed_at?: string;
  receipt_url?: string;
  payment_type: 'subscription' | 'one_time' | 'refund';
  created_at: string;
  updated_at: string;
}

// 빌링키 타입
export interface BillingKey {
  id: string;
  user_id: string;
  billing_key: string;
  customer_key: string;
  status: 'active' | 'inactive' | 'expired';
  method?: string;
  card_info?: {
    number: string; // 마스킹된 카드번호
    company: string; // 카드사
    card_type: string; // 카드 타입
  };
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// 사용자 결제 정보 타입
export interface UserPaymentInfo {
  id: string;
  user_id: string;
  customer_key: string;
  default_payment_method?: string;
  billing_address?: {
    name: string;
    phone: string;
    address: string;
    postal_code: string;
    country: string;
  };
  tax_id?: string;
  created_at: string;
  updated_at: string;
}

// 환불 타입
export interface Refund {
  id: string;
  payment_id: string;
  refund_key: string;
  amount: number;
  reason?: string;
  status: 'READY' | 'PROCESSING' | 'DONE' | 'CANCELED';
  processed_at?: string;
  created_at: string;
  updated_at: string;
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
    refundReceiveAccount: {
      bankCode: string;
      accountNumber: string;
      holderName: string;
    };
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
  discount?: {
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
  escrowProducts?: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  discountCode?: string;
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
  useEscrow?: boolean;
  taxFreeAmount?: number;
  taxExemptionAmount?: number;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 구독 상태 확인 타입
export interface SubscriptionStatus {
  isActive: boolean;
  plan?: SubscriptionPlan;
  subscription?: UserSubscription;
  usage: {
    daily_searches: number;
    trend_reports: number;
  };
  limits: {
    daily_searches: number;
    trend_reports: number;
  };
}
