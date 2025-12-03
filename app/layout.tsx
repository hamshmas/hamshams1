import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "회생의 기적 - 개인회생 탕감률 계산기 | 블랙스톤 법률사무소",
  description: "3분만에 개인회생 예상 탕감률을 무료로 계산해보세요. 블랙스톤 법률사무소 전문 변호사가 상담해드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="antialiased">
        <Script
          src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
