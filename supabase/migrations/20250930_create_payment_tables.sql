-- 결제 관련 테이블 생성

-- 1. 구독 플랜 테이블
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'KRW',
  interval VARCHAR(20) NOT NULL DEFAULT 'month', -- 'month', 'year'
  interval_count INTEGER NOT NULL DEFAULT 1,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 사용자 구독 테이블
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  billing_key_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'paused'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 결제 테이블
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  payment_key VARCHAR(200) NOT NULL UNIQUE,
  order_id VARCHAR(200) NOT NULL UNIQUE,
  order_name VARCHAR(200) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'KRW',
  payment_method VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'done', 'canceled', 'failed'
  payment_type VARCHAR(20) NOT NULL DEFAULT 'one_time', -- 'one_time', 'recurring'
  approved_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 빌링키 테이블
CREATE TABLE IF NOT EXISTS billing_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  billing_key VARCHAR(200) NOT NULL UNIQUE,
  customer_key VARCHAR(200) NOT NULL,
  method VARCHAR(50),
  card_info JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'expired'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. 사용자 결제 정보 테이블
CREATE TABLE IF NOT EXISTS user_payment_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  customer_key VARCHAR(200) NOT NULL UNIQUE,
  default_payment_method VARCHAR(50),
  billing_address JSONB,
  tax_id VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. 환불 테이블
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  refund_key VARCHAR(200) NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_key ON payments(payment_key);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_billing_keys_user_id ON billing_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_keys_billing_key ON billing_keys(billing_key);
CREATE INDEX IF NOT EXISTS idx_billing_keys_status ON billing_keys(status);
CREATE INDEX IF NOT EXISTS idx_user_payment_info_user_id ON user_payment_info(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);

-- 기본 무료 플랜 생성
INSERT INTO subscription_plans (name, display_name, description, price, features)
VALUES (
  'free',
  '무료 플랜',
  '기본 기능을 사용할 수 있는 무료 플랜입니다.',
  0,
  '{"limits": {"daily_searches": 10, "trend_reports": 5}}'::JSONB
) ON CONFLICT (name) DO NOTHING;

-- 베이직 플랜 생성
INSERT INTO subscription_plans (name, display_name, description, price, features)
VALUES (
  'basic',
  '베이직 플랜',
  '더 많은 기능을 사용할 수 있는 베이직 플랜입니다.',
  9900,
  '{"limits": {"daily_searches": 100, "trend_reports": 50}}'::JSONB
) ON CONFLICT (name) DO NOTHING;

-- 프로 플랜 생성
INSERT INTO subscription_plans (name, display_name, description, price, features)
VALUES (
  'pro',
  '프로 플랜',
  '무제한으로 모든 기능을 사용할 수 있는 프로 플랜입니다.',
  29900,
  '{"limits": {"daily_searches": -1, "trend_reports": -1}}'::JSONB
) ON CONFLICT (name) DO NOTHING;
