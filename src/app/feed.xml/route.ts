import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = 'https://speranza-sigma.vercel.app'
  const currentDate = new Date().toUTCString()
  
  // RSS 피드 XML 생성
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Speranza - AI YouTube 콘텐츠 어시스턴트</title>
    <description>YouTube 트렌드를 분석하고 AI가 맞춤형 콘텐츠 아이디어를 생성해드립니다.</description>
    <link>${baseUrl}</link>
    <language>ko-KR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Speranza RSS Generator</generator>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>Speranza</title>
      <link>${baseUrl}</link>
    </image>
    
    <item>
      <title>🎯 YouTube 트렌드 분석 서비스</title>
      <description>실시간 YouTube 트렌드 비디오를 분석하고 인기 콘텐츠를 발견하세요. AI가 맞춤형 콘텐츠 아이디어를 제안합니다.</description>
      <link>${baseUrl}</link>
      <guid isPermaLink="false">${baseUrl}#trend-analysis</guid>
      <pubDate>${currentDate}</pubDate>
      <category>YouTube</category>
      <category>트렌드</category>
      <category>AI</category>
    </item>
    
    <item>
      <title>📊 실시간 트렌드 모니터링</title>
      <description>YouTube에서 가장 인기 있는 비디오를 실시간으로 모니터링하고 분석합니다. 카테고리별, 지역별 트렌드를 확인하세요.</description>
      <link>${baseUrl}</link>
      <guid isPermaLink="false">${baseUrl}#trend-monitoring</guid>
      <pubDate>${currentDate}</pubDate>
      <category>모니터링</category>
      <category>분석</category>
    </item>
    
    <item>
      <title>🔍 콘텐츠 검색 및 필터링</title>
      <description>키워드로 YouTube 콘텐츠를 검색하고 다양한 필터를 적용하여 원하는 콘텐츠를 찾아보세요.</description>
      <link>${baseUrl}</link>
      <guid isPermaLink="false">${baseUrl}#content-search</guid>
      <pubDate>${currentDate}</pubDate>
      <category>검색</category>
      <category>필터링</category>
    </item>
    
    <item>
      <title>👤 회원가입 및 로그인</title>
      <description>Speranza 서비스를 이용하려면 회원가입이 필요합니다. 간편한 이메일 인증으로 시작하세요.</description>
      <link>${baseUrl}/auth/signup</link>
      <guid isPermaLink="false">${baseUrl}/auth/signup</guid>
      <pubDate>${currentDate}</pubDate>
      <category>회원가입</category>
      <category>인증</category>
    </item>
    
    <item>
      <title>⚙️ 관리자 패널</title>
      <description>관리자 전용 기능으로 사용자 관리 및 시스템 통계를 확인할 수 있습니다.</description>
      <link>${baseUrl}/admin</link>
      <guid isPermaLink="false">${baseUrl}/admin</guid>
      <pubDate>${currentDate}</pubDate>
      <category>관리자</category>
      <category>통계</category>
    </item>
    
    <item>
      <title>🔑 YouTube API 키 설정</title>
      <description>YouTube Data API v3 키를 설정하여 더 많은 기능을 이용하세요. 트렌드 분석과 검색 기능을 활용할 수 있습니다.</description>
      <link>${baseUrl}</link>
      <guid isPermaLink="false">${baseUrl}#api-key</guid>
      <pubDate>${currentDate}</pubDate>
      <category>API</category>
      <category>설정</category>
    </item>
  </channel>
</rss>`

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1시간 캐시
    },
  })
}