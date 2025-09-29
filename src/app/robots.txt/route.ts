import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = 'https://speranza-sigma.vercel.app'
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24시간 캐시
    },
  })
}
