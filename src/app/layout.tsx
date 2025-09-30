import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speranza - AI YouTube 콘텐츠 어시스턴트",
  description: "YouTube 트렌드를 분석하고 AI가 맞춤형 콘텐츠 아이디어를 생성해드립니다.",
  verification: {
    google: "7cfgmgyX_ZoyaB4IC2yeyPA5zU-72jKOcGQQWz32Z9Q",
    other: {
      "naver-site-verification": "1788b4b084fd5d45eaa10a4208a2a3610c422bda",
    },
  },
};

import Provider from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Provider session={null}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
