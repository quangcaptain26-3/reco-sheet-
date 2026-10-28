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
  title: "RecoSheet · Đối soát Excel an toàn trong trình duyệt",
  description:
    "Kéo thả hai bảng tính Excel/CSV để tự động làm sạch dữ liệu, so khớp mã đơn và bóc tách chênh lệch giá trị. 100% xử lý trong bộ nhớ trình duyệt.",
  applicationName: "RecoSheet",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
