import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "개인회생 예상 탕감률 조회",
  description: "개인회생 예상 탕감률을 간편하게 조회해보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
