import { supabase } from './supabase';
import type {
  SubscriptionPlan,
  UserSubscription,
  Payment,
  BillingKey,
  UserPaymentInfo,
  Refund,
  SubscriptionStatus
} from '@/types/payment';

// 구독 플랜 관련 함수
export const planDb = {
  // 모든 활성 플랜 조회
  async findAll(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      throw new Error(`구독 플랜 조회 실패: ${error.message}`);
    }

    return data || [];
  },

  // 플랜 ID로 조회
  async findById(id: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`구독 플랜 조회 실패: ${error.message}`);
    }

    return data;
  },

  // 플랜 이름으로 조회
  async findByName(name: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`구독 플랜 조회 실패: ${error.message}`);
    }

    return data;
  }
};

// 사용자 구독 관련 함수
export const subscriptionDb = {
  // 사용자 활성 구독 조회
  async findByUserId(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`구독 조회 실패: ${error.message}`);
    }

    return data;
  },

  // 구독 생성
  async create(subscription: {
    user_id: string;
    plan_id: string;
    billing_key_id?: string;
    expires_at?: string;
    next_billing_date?: string;
  }): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert([subscription])
      .select()
      .single();

    if (error) {
      throw new Error(`구독 생성 실패: ${error.message}`);
    }

    return data;
  },

  // 구독 상태 업데이트
  async updateStatus(
    subscriptionId: string,
    status: 'active' | 'cancelled' | 'expired' | 'paused',
    additionalData?: {
      cancelled_at?: string;
      expires_at?: string;
      next_billing_date?: string;
    }
  ): Promise<UserSubscription | null> {
    const updateData: any = { status };
    
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`구독 상태 업데이트 실패: ${error.message}`);
    }

    return data;
  },

  // 구독 취소
  async cancel(subscriptionId: string): Promise<UserSubscription | null> {
    return this.updateStatus(subscriptionId, 'cancelled', {
      cancelled_at: new Date().toISOString()
    });
  },

  // 만료된 구독 조회
  async findExpired(): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString());

    if (error) {
      throw new Error(`만료된 구독 조회 실패: ${error.message}`);
    }

    return data || [];
  }
};

// 결제 관련 함수
export const paymentDb = {
  // 결제 생성
  async create(payment: {
    user_id: string;
    subscription_id?: string;
    payment_key: string;
    order_id: string;
    order_name: string;
    amount: number;
    currency: string;
    payment_method?: string;
    status: string;
    payment_type: string;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();

    if (error) {
      throw new Error(`결제 생성 실패: ${error.message}`);
    }

    return data;
  },

  // 결제 상태 업데이트
  async updateStatus(
    paymentKey: string,
    status: string,
    additionalData?: {
      approved_at?: string;
      canceled_at?: string;
      failed_at?: string;
      receipt_url?: string;
    }
  ): Promise<Payment | null> {
    const updateData: any = { status };
    
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('payment_key', paymentKey)
      .select()
      .single();

    if (error) {
      throw new Error(`결제 상태 업데이트 실패: ${error.message}`);
    }

    return data;
  },

  // 사용자 결제 내역 조회
  async findByUserId(userId: string, limit = 20): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`결제 내역 조회 실패: ${error.message}`);
    }

    return data || [];
  },

  // 결제 키로 조회
  async findByPaymentKey(paymentKey: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_key', paymentKey)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`결제 조회 실패: ${error.message}`);
    }

    return data;
  },

  // 주문 ID로 조회
  async findByOrderId(orderId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`결제 조회 실패: ${error.message}`);
    }

    return data;
  }
};

// 빌링키 관련 함수
export const billingKeyDb = {
  // 빌링키 생성
  async create(billingKey: {
    user_id: string;
    billing_key: string;
    customer_key: string;
    method?: string;
    card_info?: any;
    expires_at?: string;
  }): Promise<BillingKey> {
    const { data, error } = await supabase
      .from('billing_keys')
      .insert([billingKey])
      .select()
      .single();

    if (error) {
      throw new Error(`빌링키 생성 실패: ${error.message}`);
    }

    return data;
  },

  // 사용자 빌링키 조회
  async findByUserId(userId: string): Promise<BillingKey[]> {
    const { data, error } = await supabase
      .from('billing_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`빌링키 조회 실패: ${error.message}`);
    }

    return data || [];
  },

  // 빌링키로 조회
  async findByBillingKey(billingKey: string): Promise<BillingKey | null> {
    const { data, error } = await supabase
      .from('billing_keys')
      .select('*')
      .eq('billing_key', billingKey)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`빌링키 조회 실패: ${error.message}`);
    }

    return data;
  },

  // 빌링키 상태 업데이트
  async updateStatus(
    billingKey: string,
    status: 'active' | 'inactive' | 'expired'
  ): Promise<BillingKey | null> {
    const { data, error } = await supabase
      .from('billing_keys')
      .update({ status })
      .eq('billing_key', billingKey)
      .select()
      .single();

    if (error) {
      throw new Error(`빌링키 상태 업데이트 실패: ${error.message}`);
    }

    return data;
  }
};

// 사용자 결제 정보 관련 함수
export const userPaymentInfoDb = {
  // 사용자 결제 정보 생성
  async create(paymentInfo: {
    user_id: string;
    customer_key: string;
    default_payment_method?: string;
    billing_address?: any;
    tax_id?: string;
  }): Promise<UserPaymentInfo> {
    const { data, error } = await supabase
      .from('user_payment_info')
      .insert([paymentInfo])
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 결제 정보 생성 실패: ${error.message}`);
    }

    return data;
  },

  // 사용자 결제 정보 조회
  async findByUserId(userId: string): Promise<UserPaymentInfo | null> {
    const { data, error } = await supabase
      .from('user_payment_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`사용자 결제 정보 조회 실패: ${error.message}`);
    }

    return data;
  },

  // 사용자 결제 정보 업데이트
  async update(
    userId: string,
    updates: {
      default_payment_method?: string;
      billing_address?: any;
      tax_id?: string;
    }
  ): Promise<UserPaymentInfo | null> {
    const { data, error } = await supabase
      .from('user_payment_info')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 결제 정보 업데이트 실패: ${error.message}`);
    }

    return data;
  }
};

// 환불 관련 함수
export const refundDb = {
  // 환불 생성
  async create(refund: {
    payment_id: string;
    refund_key: string;
    amount: number;
    reason?: string;
  }): Promise<Refund> {
    const { data, error } = await supabase
      .from('refunds')
      .insert([refund])
      .select()
      .single();

    if (error) {
      throw new Error(`환불 생성 실패: ${error.message}`);
    }

    return data;
  },

  // 환불 상태 업데이트
  async updateStatus(
    refundKey: string,
    status: string,
    processedAt?: string
  ): Promise<Refund | null> {
    const updateData: any = { status };
    
    if (processedAt) {
      updateData.processed_at = processedAt;
    }

    const { data, error } = await supabase
      .from('refunds')
      .update(updateData)
      .eq('refund_key', refundKey)
      .select()
      .single();

    if (error) {
      throw new Error(`환불 상태 업데이트 실패: ${error.message}`);
    }

    return data;
  }
};

// 구독 상태 확인 함수
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    // 사용자의 활성 구독 조회
    const subscription = await subscriptionDb.findByUserId(userId);
    
    if (!subscription) {
      // 기본 무료 플랜
      const freePlan = await planDb.findByName('free');
      return {
        isActive: true,
        plan: freePlan || undefined,
        usage: { daily_searches: 0, trend_reports: 0 },
        limits: freePlan?.features.limits || { daily_searches: 10, trend_reports: 5 }
      };
    }

    // 플랜 정보 조회
    const plan = await planDb.findById(subscription.plan_id);
    
    // 사용량 조회 (실제 구현에서는 별도 테이블에서 조회)
    const usage = {
      daily_searches: 0, // TODO: 실제 사용량 조회
      trend_reports: 0   // TODO: 실제 사용량 조회
    };

    return {
      isActive: subscription.status === 'active',
      plan,
      subscription,
      usage,
      limits: plan?.features.limits || { daily_searches: 10, trend_reports: 5 }
    };
  } catch (error) {
    console.error('구독 상태 조회 실패:', error);
    throw error;
  }
}
