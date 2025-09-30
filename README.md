# Speranza - AI 기반 YouTube 콘텐츠 어시스턴트

Speranza는 YouTube 트렌드를 분석하고 AI가 맞춤형 콘텐츠 아이디어를 생성하는 웹 애플리케이션입니다. 성공적인 유튜버가 되기 위한 모든 도구를 제공합니다.

## 🚀 주요 기능

### 📊 트렌드 분석
- 실시간 YouTube 트렌딩 비디오 분석
- 카테고리별 인기 콘텐츠 파악
- 키워드 기반 검색 및 분석
- 트렌드 점수 계산 및 순위

### 🤖 AI 콘텐츠 생성
- 맞춤형 비디오 아이디어 생성
- 제목 제안 및 최적화
- 비디오 설명 템플릿 제공
- 해시태그 제안
- 콘텐츠 일정 제안

### 📈 성과 예측
- 콘텐츠 아이디어의 예상 조회수 예측
- 키워드 매칭 점수 분석
- 개선 권장사항 제시

### 💳 구독 및 결제
- **토스페이먼츠 API 개별 연동 키 방식**
- **단건결제**: 일회성 카드 결제 지원
- **정기결제 (빌링)**: 카드 정보 등록 후 자동 결제
- 유연한 구독 플랜 (무료/월간/연간)
- 안전한 결제 처리 및 자동 갱신
- 결제 내역 조회 및 환불 관리
- 빌링키 관리 및 정기결제 해지
- 다양한 결제수단 지원 (카드, 계좌이체, 가상계좌, 간편결제 등)

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Icons**: Lucide React
- **Authentication**: NextAuth.js
- **Database**: Supabase (PostgreSQL)
- **Payment**: 토스페이먼츠 SDK v2
- **API**: YouTube Data API v3
- **AI**: OpenAI GPT

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/evermorning/speranza.git
cd speranza
```

### 2. Supabase 데이터베이스 설정

#### 결제 테이블 생성
Supabase SQL Editor에서 다음 마이그레이션 파일을 실행하세요:

1. Supabase Dashboard에 로그인
2. 프로젝트 선택 후 `SQL Editor` 메뉴로 이동
3. `supabase/migrations/20250930_create_payment_tables.sql` 파일의 내용을 복사
4. SQL Editor에 붙여넣기 후 `Run` 버튼 클릭
5. 테이블이 성공적으로 생성되었는지 확인

생성되는 테이블:
- `subscription_plans`: 구독 플랜 정보
- `user_subscriptions`: 사용자 구독 정보
- `payments`: 결제 내역
- `billing_keys`: 빌링키 (정기결제용)
- `user_payment_info`: 사용자 결제 정보
- `refunds`: 환불 내역

### 3. 의존성 설치
```bash
npm install
```

### 4. 환경 변수 설정
`.env.local` 파일을 프로젝트 루트에 생성하고 다음 환경 변수를 설정하세요:

```env
# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 토스페이먼츠 API 개별 연동 키 (실제 테스트 키)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_Gv6LjeKD8aj04PvMoOeL3wYxAdXy
TOSS_SECRET_KEY=test_sk_DnyRpQWGrN9pM6nOWl50VKwv1M9E

# 결제 리다이렉트 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# YouTube API
YOUTUBE_API_KEY=your-youtube-api-key

# OpenAI API
OPENAI_API_KEY=your-openai-api-key
```

#### API 키 발급 방법:

**YouTube API 키**
1. [Google Cloud Console](https://console.developers.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" → "라이브러리"에서 "YouTube Data API v3" 활성화
4. "사용자 인증 정보" → "사용자 인증 정보 만들기" → "API 키" 생성

**토스페이먼츠 API 키**
1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/)에 가입
2. **API 개별 연동 키** 방식 사용 (결제위젯이 아님)
3. 테스트 키는 위에 제공된 키를 사용하거나 개발자센터에서 발급
4. 라이브 키는 상점 심사 완료 후 발급

**Supabase 설정**
1. [Supabase](https://supabase.com/)에서 새 프로젝트 생성
2. Settings → API에서 URL과 API 키 복사
3. SQL Editor에서 데이터베이스 스키마 생성

### 4. 데이터베이스 마이그레이션
Supabase SQL Editor에서 다음 스키마를 실행하세요:

```sql
-- 구독 플랜 테이블
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'KRW',
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  features JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 구독 테이블
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  billing_key_id UUID,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 결제 테이블
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES user_subscriptions(id),
  payment_key VARCHAR(200) NOT NULL UNIQUE,
  order_id VARCHAR(200) NOT NULL UNIQUE,
  order_name VARCHAR(200) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'KRW',
  payment_method VARCHAR(50),
  status VARCHAR(50) NOT NULL,
  approved_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  receipt_url TEXT,
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('subscription', 'one_time', 'refund')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 빌링키 테이블
CREATE TABLE billing_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  billing_key VARCHAR(200) NOT NULL UNIQUE,
  customer_key VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'expired')),
  method VARCHAR(50),
  card_info JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 결제 정보 테이블
CREATE TABLE user_payment_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  customer_key VARCHAR(200) NOT NULL UNIQUE,
  default_payment_method VARCHAR(50),
  billing_address JSONB,
  tax_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 환불 테이블
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  refund_key VARCHAR(200) NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('READY', 'PROCESSING', 'DONE', 'CANCELED')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 구독 플랜 데이터 삽입
INSERT INTO subscription_plans (name, display_name, description, price, billing_cycle, features) VALUES
('free', '무료 플랜', '기본 기능을 무료로 이용하세요', 0, 'monthly', '{"limits": {"daily_searches": 10, "trend_reports": 5}, "features": ["기본 트렌드 분석", "제한된 AI 콘텐츠 생성"]}'),
('basic', '베이직 플랜', '개인 크리에이터를 위한 플랜', 9900, 'monthly', '{"limits": {"daily_searches": 100, "trend_reports": 20}, "features": ["전체 트렌드 분석", "무제한 AI 콘텐츠 생성", "성과 예측 기능", "이메일 지원"]}'),
('pro', '프로 플랜', '전문 크리에이터를 위한 플랜', 29900, 'monthly', '{"limits": {"daily_searches": -1, "trend_reports": -1}, "features": ["무제한 트렌드 분석", "고급 AI 콘텐츠 생성", "상세 성과 예측", "경쟁사 분석", "우선 고객 지원", "API 접근"]}');
```

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 🎯 사용 방법

### 1. 회원가입 및 로그인
- 이메일과 비밀번호로 회원가입
- 로그인하여 서비스 이용 시작

### 2. 구독 플랜 선택
- `/subscription` 페이지에서 적합한 플랜 선택
- 무료 플랜으로 시작하거나 유료 플랜으로 업그레이드
- 토스페이먼츠를 통한 안전한 결제 진행

### 3. 트렌드 분석
- "트렌드 분석" 탭에서 실시간 트렌딩 비디오 확인
- 카테고리별 필터링 및 키워드 검색
- 인기 키워드 및 트렌드 점수 분석

### 4. 콘텐츠 생성
- "콘텐츠 생성" 탭에서 채널 설정
- 관심 카테고리 및 콘텐츠 유형 선택
- AI가 생성한 맞춤형 아이디어 확인
- 성과 예측 및 개선 권장사항 검토

### 5. 단건결제 (일회성 결제)
- `/payment/one-time`에서 단건결제 진행
- 카드, 간편결제 등 다양한 결제수단 지원
- 토스페이먼츠 SDK v2 통합결제창 사용

### 6. 정기결제 (자동결제) 등록
- `/billing/register`에서 카드 정보 등록
- 빌링키 발급으로 자동 결제 활성화
- 별도의 인증 없이 매월 자동 결제

### 7. 정기결제 관리
- `/billing/manage`에서 등록된 빌링키 확인
- 정기결제 해지 및 카드 정보 변경
- 결제 일정 및 내역 확인

### 8. 결제 내역 관리
- `/payment/history`에서 모든 결제 내역 확인
- 구독 취소 및 환불 요청
- 플랜 변경 및 업그레이드

## 📁 프로젝트 구조

```
src/
├── app/                           # Next.js 앱 라우터
│   ├── api/                      # API 라우트
│   │   ├── auth/                # 인증 API
│   │   ├── billing/             # 빌링 API
│   │   │   ├── issue/           # 빌링키 발급
│   │   │   ├── pay/             # 빌링키로 결제
│   │   │   └── delete/          # 빌링키 삭제
│   │   ├── payment/             # 결제 API
│   │   │   ├── confirm/         # 결제 승인
│   │   │   ├── cancel/          # 결제 취소
│   │   │   └── history/         # 결제 내역
│   │   └── subscription/        # 구독 API
│   │       ├── plans/           # 플랜 조회
│   │       └── status/          # 구독 상태
│   ├── auth/                     # 인증 페이지
│   │   ├── signin/              # 로그인
│   │   ├── signup/              # 회원가입
│   │   └── reset-password/      # 비밀번호 재설정
│   ├── payment/                  # 결제 페이지
│   │   ├── one-time/            # 단건결제
│   │   ├── success/             # 결제 성공
│   │   ├── fail/                # 결제 실패
│   │   └── history/             # 결제 내역
│   ├── billing/                  # 정기결제
│   │   ├── register/            # 빌링키 등록
│   │   └── manage/              # 빌링키 관리
│   ├── subscription/             # 구독 플랜 선택
│   ├── globals.css              # 전역 스타일
│   ├── layout.tsx               # 루트 레이아웃
│   └── page.tsx                 # 메인 페이지
├── components/                   # React 컴포넌트
│   ├── ui/                      # 기본 UI 컴포넌트
│   └── trend-analyzer.tsx       # 트렌드 분석 컴포넌트
├── lib/                          # 유틸리티 및 API
│   ├── auth.ts                  # NextAuth 설정
│   ├── supabase.ts              # Supabase 클라이언트
│   ├── toss-payments.ts         # 토스페이먼츠 API
│   ├── payment-db.ts            # 결제 DB 함수
│   ├── youtube-client.ts        # YouTube API 클라이언트
│   └── utils.ts                 # 공통 유틸리티
└── types/                        # TypeScript 타입 정의
    └── payment.ts               # 결제 관련 타입
```

## 🔧 주요 기능 모듈

### 인증 시스템 (NextAuth.js)
- 이메일/비밀번호 기반 인증
- 세션 관리 및 보안
- 비밀번호 재설정 기능

### 결제 시스템 (토스페이먼츠)
- **API 개별 연동 키 방식** 사용
- **단건결제**: SDK v2 통합결제창으로 일회성 결제
- **정기결제 (빌링)**: 빌링키 발급 후 자동 결제
  - 카드 정보로 빌링키 발급
  - 빌링키로 반복 결제 (별도 인증 불필요)
  - 정기결제 해지 기능
- 다양한 결제수단 지원 (카드, 계좌이체, 가상계좌, 간편결제)
- 결제 승인 및 취소
- 환불 처리
- 결제 내역 관리

### 구독 관리
- 유연한 구독 플랜 (무료/유료)
- 월간/연간 청구 주기
- 자동 갱신 및 취소
- 플랜 변경 및 업그레이드

### YouTube API 연동
- YouTube Data API v3 통합
- 트렌딩 비디오 분석
- 키워드 검색 및 카테고리별 필터링
- 실시간 데이터 조회

### AI 콘텐츠 생성
- OpenAI GPT 기반 콘텐츠 생성
- 맞춤형 비디오 아이디어 제안
- 제목, 설명, 해시태그 자동 생성
- 성과 예측 및 개선 권장사항

## 🚀 배포

### Vercel 배포
1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정 (모든 API 키 및 시크릿 설정)
3. Supabase 데이터베이스 연결
4. 자동 배포 완료

### 환경 변수 설정 (프로덕션)
프로덕션 배포 시 다음 환경 변수를 설정하세요:
- ✅ 모든 API 키를 프로덕션 키로 교체
- ✅ `NEXTAUTH_SECRET`을 강력한 랜덤 문자열로 설정
- ✅ `NEXT_PUBLIC_BASE_URL`을 실제 도메인으로 설정
- ✅ 토스페이먼츠 테스트 키를 라이브 키로 교체 (상점 심사 완료 후)
- ✅ Supabase 프로덕션 인스턴스 사용

### 기타 플랫폼
- Netlify, AWS Amplify 등 다른 플랫폼에서도 배포 가능
- 서버 컴포넌트 및 API 라우트를 지원하는 플랫폼 권장

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

**Speranza** - AI와 함께하는 스마트한 YouTube 콘텐츠 제작 🎬✨