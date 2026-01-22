import type { Metadata } from "next";
import Script from "next/script";
import { ToastProvider } from "@/app/components/ui/ToastProvider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hoesaeng.kr";

export const metadata: Metadata = {
  title: "회생의 기적 - 개인회생 탕감률 계산기 | 블랙스톤 법률사무소",
  description:
    "3분만에 개인회생 예상 탕감률을 무료로 계산해보세요. 블랙스톤 법률사무소 전문 변호사가 상담해드립니다. 빚 탕감, 채무조정, 개인회생 전문.",
  keywords: [
    "개인회생",
    "탕감률",
    "채무조정",
    "빚정리",
    "개인회생 계산기",
    "법률상담",
    "블랙스톤",
  ],
  authors: [{ name: "블랙스톤 법률사무소" }],
  creator: "블랙스톤 법률사무소",
  publisher: "블랙스톤 법률사무소",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "회생의 기적",
    title: "개인회생 탕감률 계산기 | 무료로 내 탕감률 확인",
    description:
      "빚, 얼마나 줄일 수 있을까요? 3분만에 개인회생 예상 탕감률을 무료로 계산해보세요.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "회생의 기적 - 개인회생 탕감률 계산기",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "개인회생 탕감률 계산기 | 회생의 기적",
    description: "3분만에 개인회생 예상 탕감률을 무료로 계산해보세요.",
    images: [`${siteUrl}/og-image.png`],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical
  alternates: {
    canonical: siteUrl,
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "회생의 기적 - 개인회생 탕감률 계산기",
  description: "개인회생 예상 탕감률을 무료로 계산해볼 수 있는 서비스",
  url: siteUrl,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
  provider: {
    "@type": "LegalService",
    name: "블랙스톤 법률사무소",
    telephone: "02-6101-3100",
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Script
          src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="beforeInteractive"
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
