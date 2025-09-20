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

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Icons**: Lucide React
- **API**: YouTube Data API v3
- **AI**: 클라이언트 사이드 AI 로직

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/evermorning/speranza.git
cd speranza
```

### 2. 의존성 설치
```bash
npm install
```

### 3. YouTube API 키 설정
1. [Google Cloud Console](https://console.developers.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" → "라이브러리"에서 "YouTube Data API v3" 활성화
4. "사용자 인증 정보" → "사용자 인증 정보 만들기" → "API 키" 생성
5. 애플리케이션 실행 후 API 키 입력

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 🎯 사용 방법

### 1. API 키 설정
- 애플리케이션 첫 실행 시 YouTube API 키를 입력
- API 키는 브라우저 로컬 스토리지에 안전하게 저장됩니다

### 2. 트렌드 분석
- "트렌드 분석" 탭에서 실시간 트렌딩 비디오 확인
- 카테고리별 필터링 및 키워드 검색
- 인기 키워드 및 트렌드 점수 분석

### 3. 콘텐츠 생성
- "콘텐츠 생성" 탭에서 채널 설정
- 관심 카테고리 및 콘텐츠 유형 선택
- AI가 생성한 맞춤형 아이디어 확인
- 성과 예측 및 개선 권장사항 검토

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js 앱 라우터
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── trend-analyzer.tsx # 트렌드 분석 컴포넌트
│   └── content-generator.tsx # 콘텐츠 생성 컴포넌트
└── lib/                  # 유틸리티 및 API
    ├── youtube-api.ts    # YouTube API 클라이언트
    ├── content-generator.ts # AI 콘텐츠 생성기
    └── utils.ts          # 공통 유틸리티
```

## 🔧 주요 컴포넌트

### YouTubeAPI 클래스
- YouTube Data API v3와의 통신
- 트렌딩 비디오, 검색, 카테고리별 분석
- 에러 핸들링 및 데이터 변환

### TrendAnalyzer 클래스
- 트렌드 데이터 분석 및 키워드 추출
- 카테고리별 성과 분석
- 트렌드 점수 계산

### ContentGenerator 클래스
- AI 기반 콘텐츠 아이디어 생성
- 제목, 설명, 해시태그 제안
- 성과 예측 및 개선 권장사항

## 🚀 배포

### Vercel 배포
1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정 (선택사항)
3. 자동 배포 완료

### 기타 플랫폼
- Netlify, AWS Amplify 등 다른 플랫폼에서도 배포 가능
- 정적 사이트로 빌드하여 호스팅

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