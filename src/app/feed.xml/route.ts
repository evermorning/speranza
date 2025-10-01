import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // feed.xml 요청을 rss.xml로 리다이렉트
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://speranza.vercel.app'
  
  return NextResponse.redirect(`${baseUrl}/rss.xml`, {
    status: 301, // 영구 리다이렉트
  })
}
