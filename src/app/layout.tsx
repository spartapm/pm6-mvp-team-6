import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "nook",
  description: "장소를 기록하고 공유하는 지도 기반 기록 SNS, nook",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        {/* 모바일 전용: 가운데 정렬된 폰 너비 프레임 */}
        <div className="relative mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:rounded-[28px] sm:shadow-frame sm:overflow-hidden">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </body>
    </html>
  );
}
