import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://speranza.vercel.app'
  const siteName = 'Speranza'

  // RSS 피드에 포함할 페이지들
  const pages = [
    {
      url: `${baseUrl}/`,
      title: 'Speranza - YouTube 트렌드 분석',
      description: 'YouTube 트렌드 분석 및 인사이트 제공 서비스',
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/billing/register`,
      title: '요금제 등록 - Speranza',
      description: 'Speranza 요금제 등록 및 결제',
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/payment/one-time`,
      title: '일회성 결제 - Speranza',
      description: 'Speranza 일회성 결제 서비스',
      lastModified: new Date(),
    },
  ]

  // RSS XML 생성
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <description>YouTube 트렌드 분석 및 인사이트 제공 서비스</description>
    <link>${baseUrl}</link>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <generator>Speranza RSS Generator</generator>
    
    ${pages.map(page => `
    <item>
      <title><![CDATA[${page.title}]]></title>
      <description><![CDATA[${page.description}]]></description>
      <link>${page.url}</link>
      <guid isPermaLink="true">${page.url}</guid>
      <pubDate>${page.lastModified.toUTCString()}</pubDate>
      <lastBuildDate>${page.lastModified.toUTCString()}</lastBuildDate>
    </item>`).join('')}
  </channel>
</rss>`

  return new NextResponse(rssXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1시간 캐시
    },
  })
}

